import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as service from "./document.service";
import { uploadToCloudinary } from "../../config/cloudinary";
import { ApiError } from "../../utils/apiError";

export const uploadDocument = catchAsync(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;
  if (!file) throw ApiError.badRequest("No file provided");

  const url = await uploadToCloudinary(file.buffer, "documents");
  const document = await service.uploadDocument(req.user!.id, url, file.originalname, req.body.type, req.body.leaseId);
  return sendSuccess(res, { statusCode: 201, message: "Document uploaded successfully", data: { document } });
});

export const listMyDocuments = catchAsync(async (req: Request, res: Response) => {
  const documents = await service.listMyDocuments(req.user!.id);
  return sendSuccess(res, { message: "Documents fetched successfully", data: { documents } });
});

export const getDocument = catchAsync(async (req: Request, res: Response) => {
  const document = await service.getDocument(req.params.id, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Document fetched successfully", data: { document } });
});

export const deleteDocument = catchAsync(async (req: Request, res: Response) => {
  await service.deleteDocument(req.params.id, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Document deleted successfully" });
});
