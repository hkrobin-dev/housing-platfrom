import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async controller/middleware so thrown errors or rejected
 * promises are automatically forwarded to Express's error handler,
 * instead of needing try/catch in every single controller.
 */
export const catchAsync =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
