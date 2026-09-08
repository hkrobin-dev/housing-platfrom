import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@housingplatform.com";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Sends a transactional email via Resend. Silently no-ops (with a console warning)
 * if RESEND_API_KEY isn't configured — email is an optional feature and its absence
 * must never break the core request that triggered it (register, payment, etc.).
 */
export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email to ${to}: "${subject}"`);
    return;
  }
  try {
    await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
  } catch (err) {
    // Never let an email failure break the calling flow (registration, payment, etc.)
    console.error("[email] Failed to send:", err);
  }
}

export function welcomeEmailHtml(name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Welcome to Housing Platform, ${name}!</h2>
      <p>Your account has been created successfully. You can now browse properties,
      find roommates, and manage your tenancy — all in one place.</p>
      <p>Happy house hunting!</p>
    </div>
  `;
}

export function paymentConfirmationEmailHtml(name: string, purpose: string, amount: number) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Payment Confirmed</h2>
      <p>Hi ${name},</p>
      <p>Your ${purpose.toLowerCase()} payment of <strong>৳${amount}</strong> was received successfully.</p>
      <p>Thank you!</p>
    </div>
  `;
}

export function passwordResetEmailHtml(name: string, resetUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Reset your password</h2>
      <p>Hi ${name},</p>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="background:#1f7a5c;color:white;padding:10px 16px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
}

export function emailVerificationHtml(name: string, verifyUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Verify your email</h2>
      <p>Hi ${name},</p>
      <p>Thanks for signing up! Please confirm your email address by clicking the button below. This link expires in 24 hours.</p>
      <p><a href="${verifyUrl}" style="background:#1f7a5c;color:white;padding:10px 16px;border-radius:6px;text-decoration:none;">Verify Email</a></p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    </div>
  `;
}