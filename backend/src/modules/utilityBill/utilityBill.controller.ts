import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as service from "./utilityBill.service";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";

export const createBill = catchAsync(async (req: Request, res: Response) => {
  const result = await service.createUtilityBillWithSplit(req.user!.id, req.user!.role, req.body);
  return sendSuccess(res, { statusCode: 201, message: "Utility bill created and split successfully", data: result });
});

export const listBillsForProperty = catchAsync(async (req: Request, res: Response) => {
  const bills = await service.listBillsForProperty(req.params.propertyId, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Utility bills fetched successfully", data: { bills } });
});

export const listMySplits = catchAsync(async (req: Request, res: Response) => {
  const splits = await service.listMySplits(req.user!.id);
  return sendSuccess(res, { message: "Your bill splits fetched successfully", data: { splits } });
});

export const paySplit = catchAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw ApiError.notFound("User not found");
  const result = await service.paySplit(req.params.id, req.user!.id, user.email, user.name);
  return sendSuccess(res, { message: "Payment session initiated", data: result });
});
