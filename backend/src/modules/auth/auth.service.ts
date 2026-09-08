import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { sendEmail, welcomeEmailHtml, passwordResetEmailHtml, emailVerificationHtml } from "../../config/email";
import { env } from "../../config/env";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: "OWNER" | "TENANT" | "MANAGER";
  phone?: string;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role ?? "TENANT",
      phone: input.phone,
      provider: "LOCAL",
    },
  });

  await sendEmail(user.email, "Welcome to Housing Platform!", welcomeEmailHtml(user.name)).catch(() => null);
  await sendVerificationEmail(user.id).catch(() => null);

  return issueTokensAndSanitize(user.id, user.role);
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) throw ApiError.unauthorized("Invalid email or password");
  if (user.isBanned) throw ApiError.forbidden("This account has been banned");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

  return issueTokensAndSanitize(user.id, user.role);
}

export async function refreshTokens(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized("Refresh token is no longer valid");
  }

  return issueTokensAndSanitize(user.id, user.role);
}

export async function logoutUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}

export async function googleAuth(idToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw ApiError.unauthorized("Invalid Google token");

  let user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        provider: "GOOGLE",
        avatarUrl: payload.picture,
        isVerified: true,
        role: "TENANT",
      },
    });
  }

  if (user.isBanned) throw ApiError.forbidden("This account has been banned");

  return issueTokensAndSanitize(user.id, user.role);
}

// Shared helper: signs tokens, persists refresh token, returns safe user object
async function issueTokensAndSanitize(userId: string, role: string) {
  const accessToken = signAccessToken({ userId, role });
  const refreshToken = signRefreshToken({ userId, role });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      isVerified: true,
      createdAt: true,
    },
  });

  return { user, accessToken, refreshToken };
}

/**
 * Generates a random reset token, stores its hash with a 1-hour expiry, and emails
 * the plain token as a link. Always resolves successfully (no user enumeration) —
 * whether or not the email exists, the caller gets the same generic response.
 */
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return; // silently no-op for Google-only or unknown accounts

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
  await sendEmail(user.email, "Reset your password", passwordResetEmailHtml(user.name, resetUrl)).catch(
    () => null
  );
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await prisma.user.findFirst({
    where: { resetPasswordToken: hashedToken, resetPasswordExpires: { gt: new Date() } },
  });
  if (!user) throw ApiError.badRequest("Password reset link is invalid or has expired");

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      refreshToken: null, // force re-login everywhere after a password reset
    },
  });
}

/**
 * Generates a fresh email-verification token (24h expiry) and emails the link.
 * Called on registration, and also exposed via /auth/resend-verification for
 * users who missed/lost the original email.
 */
export async function sendVerificationEmail(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");
  if (user.isVerified) return; // nothing to do

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;
  await sendEmail(user.email, "Verify your email", emailVerificationHtml(user.name, verifyUrl)).catch(
    () => null
  );
}

export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // no user enumeration — same generic response either way
  await sendVerificationEmail(user.id);
}

export async function verifyEmail(rawToken: string) {
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: hashedToken, emailVerificationExpires: { gt: new Date() } },
  });
  if (!user) throw ApiError.badRequest("Verification link is invalid or has expired");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });
}