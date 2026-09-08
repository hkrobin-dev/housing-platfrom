import rateLimit from "express-rate-limit";
import { sendError } from "../utils/apiResponse";

/**
 * In-memory rate limiter (no Redis required) for auth endpoints — protects
 * against brute-force login/register attempts. For multi-instance deployments,
 * swap the default MemoryStore for a Redis store (rate-limit-redis) later.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, {
      statusCode: 429,
      message: "Too many attempts. Please try again in a few minutes.",
    });
  },
});

// Stricter limiter specifically for login/register to slow down credential stuffing
export const strictAuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, {
      statusCode: 429,
      message: "Too many login/register attempts. Please try again in a few minutes.",
    });
  },
});
