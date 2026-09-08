import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as service from "./lease.service";

export const listLeasesForProperty = catchAsync(async (req: Request, res: Response) => {
  const leases = await service.listLeasesForProperty(req.params.propertyId, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Leases fetched successfully", data: { leases } });
});

export const getLease = catchAsync(async (req: Request, res: Response) => {
  const lease = await service.getLeaseById(req.params.id, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Lease fetched successfully", data: { lease } });
});

export const listMyLeases = catchAsync(async (req: Request, res: Response) => {
  const leases = await service.listMyLeases(req.user!.id);
  return sendSuccess(res, { message: "Your leases fetched successfully", data: { leases } });
});

export const terminateLease = catchAsync(async (req: Request, res: Response) => {
  const lease = await service.terminateLease(req.params.id, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Lease terminated successfully", data: { lease } });
});
