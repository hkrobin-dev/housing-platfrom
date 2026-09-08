import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as service from "./viewingRequest.service";

export const createViewingRequest = catchAsync(async (req: Request, res: Response) => {
  const viewing = await service.createViewingRequest(req.user!.id, req.body);
  return sendSuccess(res, { statusCode: 201, message: "Viewing request submitted successfully", data: { viewing } });
});

export const listMyViewingRequests = catchAsync(async (req: Request, res: Response) => {
  const viewings = await service.listMyViewingRequests(req.user!.id);
  return sendSuccess(res, { message: "Your viewing requests fetched successfully", data: { viewings } });
});

export const listPropertyViewingRequests = catchAsync(async (req: Request, res: Response) => {
  const viewings = await service.listPropertyViewingRequests(req.params.propertyId, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Property viewing requests fetched successfully", data: { viewings } });
});

export const updateViewingStatus = catchAsync(async (req: Request, res: Response) => {
  const viewing = await service.updateViewingStatus(req.params.id, req.user!.id, req.user!.role, req.body.status);
  return sendSuccess(res, { message: "Viewing request status updated successfully", data: { viewing } });
});
