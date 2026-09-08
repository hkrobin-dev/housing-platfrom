import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/auth.middleware";
import { authRateLimiter, strictAuthRateLimiter } from "../../middlewares/rateLimit.middleware";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from "./auth.validation";

const router = Router();

router.post("/register", strictAuthRateLimiter, validate(registerSchema), authController.register);
router.post("/login", strictAuthRateLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authRateLimiter, validate(refreshSchema), authController.refresh);
router.post("/google", authRateLimiter, validate(googleAuthSchema), authController.googleLogin);
router.post("/forgot-password", strictAuthRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", strictAuthRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post("/verify-email", authRateLimiter, validate(verifyEmailSchema), authController.verifyEmail);
router.post("/resend-verification", strictAuthRateLimiter, validate(resendVerificationSchema), authController.resendVerification);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;