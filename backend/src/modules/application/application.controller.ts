import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as service from "./application.service";

export const applyToRoom = catchAsync(async (req: Request, res: Response) => {
  const application = await service.applyToRoom(req.user!.id, req.body.roomId, req.body.message);
  return sendSuccess(res, { statusCode: 201, message: "Application submitted successfully", data: { application } });
});

export const listMyApplications = catchAsync(async (req: Request, res: Response) => {
  const applications = await service.listMyApplications(req.user!.id);
  return sendSuccess(res, { message: "Your applications fetched successfully", data: { applications } });
});

export const listApplicationsForOwner = catchAsync(async (req: Request, res: Response) => {
  const applications = await service.listApplicationsForOwner(req.params.propertyId, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Applications fetched successfully", data: { applications } });
});

export const reviewApplication = catchAsync(async (req: Request, res: Response) => {
  const result = await service.reviewApplication(req.params.id, req.user!.id, req.user!.role, req.body.status);
  return sendSuccess(res, { message: "Application reviewed successfully", data: result });
});
