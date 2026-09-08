import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as service from "./dashboard.service";

export const ownerDashboard = catchAsync(async (req: Request, res: Response) => {
  const stats = await service.getOwnerDashboard(req.user!.id);
  return sendSuccess(res, { message: "Owner dashboard stats fetched successfully", data: { stats } });
});

export const adminDashboard = catchAsync(async (req: Request, res: Response) => {
  const stats = await service.getAdminDashboard();
  return sendSuccess(res, { message: "Admin dashboard stats fetched successfully", data: { stats } });
});
