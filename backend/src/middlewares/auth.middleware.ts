import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/apiError";
import { prisma } from "../config/db";

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string; email: string };
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token missing");
    }
    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw ApiError.unauthorized("User no longer exists");
    if (user.isBanned) throw ApiError.forbidden("This account has been banned");

    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (err) {
    next(ApiError.unauthorized("Invalid or expired access token"));
  }
}

/**
 * Role-based authorization guard.
 * Usage: router.post("/", authenticate, authorize("ADMIN", "OWNER"), controller.create)
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }
    next();
  };
}
