import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as service from "./notification.service";

export const listMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const notifications = await service.listMyNotifications(req.user!.id);
  return sendSuccess(res, { message: "Notifications fetched successfully", data: { notifications } });
});

export const markAsRead = catchAsync(async (req: Request, res: Response) => {
  await service.markAsRead(req.params.id, req.user!.id);
  return sendSuccess(res, { message: "Notification marked as read" });
});

export const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  await service.markAllAsRead(req.user!.id);
  return sendSuccess(res, { message: "All notifications marked as read" });
});
