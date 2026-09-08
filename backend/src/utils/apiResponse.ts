import { Response } from "express";

interface SuccessPayload<T> {
  message?: string;
  data?: T;
  statusCode?: number;
}

interface ErrorPayload {
  message?: string;
  errors?: unknown[];
  statusCode?: number;
}

/**
 * Sends a consistent success response:
 * { success: true, message: "...", data: {} }
 */
export function sendSuccess<T>(res: Response, payload: SuccessPayload<T> = {}): Response {
  const { message = "Operation successful", data = {}, statusCode = 200 } = payload;
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Sends a consistent error response:
 * { success: false, message: "...", errors: [] }
 */
export function sendError(res: Response, payload: ErrorPayload = {}): Response {
  const { message = "Something went wrong", errors = [], statusCode = 500 } = payload;
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
