import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { sendError } from "../utils/apiResponse";

/**
 * Catches every error thrown/forwarded in the app (via catchAsync or next(err))
 * and always responds with: { success: false, message, errors: [] }
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  // Prisma known errors (e.g. unique constraint violation)
  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } };
    if (prismaErr.code === "P2002") {
      return sendError(res, {
        statusCode: 409,
        message: "Duplicate value violates a unique constraint",
        errors: prismaErr.meta?.target || [],
      });
    }
    if (prismaErr.code === "P2025") {
      return sendError(res, { statusCode: 404, message: "Record not found" });
    }
  }

  console.error("Unhandled error:", err);
  const message = err instanceof Error ? err.message : "Something went wrong";
  return sendError(res, { statusCode: 500, message });
}

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
