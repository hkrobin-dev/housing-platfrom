import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";

// Admin-only: list all users (role-guarded in the route)
export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isBanned: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return sendSuccess(res, {
    message: "Users fetched successfully",
    data: { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
  });
});

// Admin-only: ban or unban a user account
export const setBanStatus = catchAsync(async (req: Request, res: Response) => {
  const { isBanned } = req.body as { isBanned: boolean };
  const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!targetUser) throw ApiError.notFound("User not found");
  if (targetUser.role === "ADMIN") throw ApiError.forbidden("Admin accounts cannot be banned");

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isBanned },
    select: { id: true, name: true, email: true, role: true, isBanned: true, isVerified: true },
  });
  return sendSuccess(res, {
    message: `User ${isBanned ? "banned" : "unbanned"} successfully`,
    data: { user },
  });
});

// Admin-only: manually mark a user as verified
export const verifyUser = catchAsync(async (req: Request, res: Response) => {
  const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!targetUser) throw ApiError.notFound("User not found");

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isVerified: true },
    select: { id: true, name: true, email: true, role: true, isBanned: true, isVerified: true },
  });
  return sendSuccess(res, { message: "User verified successfully", data: { user } });
});

// Admin-only: change a user's role
export const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { role } = req.body as { role: "ADMIN" | "OWNER" | "MANAGER" | "TENANT" };
  const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!targetUser) throw ApiError.notFound("User not found");

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, isBanned: true, isVerified: true },
  });
  return sendSuccess(res, { message: "User role updated successfully", data: { user } });
});

// Self profile
export const getProfile = catchAsync(async (req: Request, res: Response) => {  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      isVerified: true,
      createdAt: true,
      roommateProfile: true,
    },
  });
  return sendSuccess(res, { message: "Profile fetched successfully", data: { user } });
});

// Self profile update (name / phone / avatar only — role & email are immutable here)
export const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { name, phone, avatarUrl } = req.body as {
    name?: string;
    phone?: string;
    avatarUrl?: string;
  };
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      isVerified: true,
      createdAt: true,
    },
  });
  return sendSuccess(res, { message: "Profile updated successfully", data: { user } });
});
