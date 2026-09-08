import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as service from "./rent.service";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";

export const generateSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await service.generateRentSchedule(req.params.leaseId, req.user!.id, req.user!.role, req.body.months ?? 12);
  return sendSuccess(res, { statusCode: 201, message: "Rent schedule generated successfully", data: result });
});

export const listRentPayments = catchAsync(async (req: Request, res: Response) => {
  const rentPayments = await service.listRentPaymentsForLease(req.params.leaseId, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Rent payments fetched successfully", data: { rentPayments } });
});

export const payRent = catchAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw ApiError.notFound("User not found");

  const result = await service.payRent(req.params.id, req.user!.id, user.email, user.name);
  return sendSuccess(res, { message: "Payment session initiated", data: result });
});
