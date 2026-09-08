import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as authService from "./auth.service";
import { ApiError } from "../../utils/apiError";

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Account created successfully",
    data: result,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  return sendSuccess(res, { message: "Logged in successfully", data: result });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshTokens(refreshToken);
  return sendSuccess(res, { message: "Token refreshed successfully", data: result });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await authService.logoutUser(req.user.id);
  return sendSuccess(res, { message: "Logged out successfully" });
});

export const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const { idToken } = req.body;
  const result = await authService.googleAuth(idToken);
  return sendSuccess(res, { message: "Logged in with Google successfully", data: result });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  return sendSuccess(res, { message: "Current user fetched", data: { user: req.user } });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.requestPasswordReset(req.body.email);
  // Always the same response regardless of whether the email exists — prevents user enumeration
  return sendSuccess(res, {
    message: "If an account exists with that email, a password reset link has been sent.",
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  return sendSuccess(res, { message: "Password reset successfully. Please log in with your new password." });
});

export const resendVerification = catchAsync(async (req: Request, res: Response) => {
  await authService.resendVerificationEmail(req.body.email);
  return sendSuccess(res, {
    message: "If an account exists with that email, a verification link has been sent.",
  });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.body.token);
  return sendSuccess(res, { message: "Email verified successfully!" });
});