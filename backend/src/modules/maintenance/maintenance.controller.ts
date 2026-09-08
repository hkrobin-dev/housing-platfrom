import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as service from "./maintenance.service";

export const createRequest = catchAsync(async (req: Request, res: Response) => {
  const request = await service.createMaintenanceRequest(req.user!.id, req.body);
  return sendSuccess(res, { statusCode: 201, message: "Maintenance request submitted successfully", data: { request } });
});

export const listMyRequests = catchAsync(async (req: Request, res: Response) => {
  const requests = await service.listMyMaintenanceRequests(req.user!.id);
  return sendSuccess(res, { message: "Your maintenance requests fetched successfully", data: { requests } });
});

export const listPropertyRequests = catchAsync(async (req: Request, res: Response) => {
  const requests = await service.listMaintenanceForProperty(req.params.propertyId, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Maintenance requests fetched successfully", data: { requests } });
});

export const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const request = await service.updateMaintenanceStatus(req.params.id, req.user!.id, req.user!.role, req.body.status);
  return sendSuccess(res, { message: "Maintenance request status updated successfully", data: { request } });
});
