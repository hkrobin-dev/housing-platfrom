import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as propertyService from "./property.service";
import { uploadToCloudinary } from "../../config/cloudinary";

export const createProperty = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.createProperty(req.user!.id, req.body);
  return sendSuccess(res, { statusCode: 201, message: "Property created successfully", data: { property } });
});

export const assignManager = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.assignManager(
    req.params.id,
    req.user!.id,
    req.user!.role,
    req.body.email
  );
  return sendSuccess(res, { message: "Manager assigned successfully", data: { property } });
});

export const removeManager = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.removeManager(req.params.id, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Manager removed successfully", data: { property } });
});

export const getActiveTenants = catchAsync(async (req: Request, res: Response) => {
  const tenants = await propertyService.getActiveTenantsForProperty(req.params.id, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Active tenants fetched successfully", data: { tenants } });
});

export const listMyProperties = catchAsync(async (req: Request, res: Response) => {
  const properties = await propertyService.listMyProperties(req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Your properties fetched successfully", data: { properties } });
});

export const listProperties = catchAsync(async (req: Request, res: Response) => {
  const { city, type, page, limit } = req.query;
  const result = await propertyService.listProperties({
    city: city as string,
    type: type as string,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  return sendSuccess(res, { message: "Properties fetched successfully", data: result });
});

export const getProperty = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.getPropertyById(req.params.id);
  return sendSuccess(res, { message: "Property fetched successfully", data: { property } });
});

export const updateProperty = catchAsync(async (req: Request, res: Response) => {
  await propertyService.assertOwnership(req.params.id, req.user!.id, req.user!.role);
  const property = await propertyService.updateProperty(req.params.id, req.body);
  return sendSuccess(res, { message: "Property updated successfully", data: { property } });
});

export const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  await propertyService.assertOwnership(req.params.id, req.user!.id, req.user!.role);
  await propertyService.deleteProperty(req.params.id);
  return sendSuccess(res, { message: "Property deleted successfully" });
});

export const uploadPropertyImages = catchAsync(async (req: Request, res: Response) => {
  await propertyService.assertOwnership(req.params.id, req.user!.id, req.user!.role);
  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) return sendSuccess(res, { statusCode: 400, message: "No images provided" });

  const urls = await Promise.all(files.map((f) => uploadToCloudinary(f.buffer, "properties")));
  const property = await propertyService.addPropertyImages(req.params.id, urls);
  return sendSuccess(res, { message: "Images uploaded successfully", data: { property } });
});
