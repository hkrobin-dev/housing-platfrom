import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as roomService from "./room.service";

export const createRoom = catchAsync(async (req: Request, res: Response) => {
  const room = await roomService.createRoom(req.params.propertyId, req.user!.id, req.user!.role, req.body);
  return sendSuccess(res, { statusCode: 201, message: "Room created successfully", data: { room } });
});

export const listRooms = catchAsync(async (req: Request, res: Response) => {
  const rooms = await roomService.listRoomsByProperty(req.params.propertyId);
  return sendSuccess(res, { message: "Rooms fetched successfully", data: { rooms } });
});

export const getRoom = catchAsync(async (req: Request, res: Response) => {
  const room = await roomService.getRoomById(req.params.id);
  return sendSuccess(res, { message: "Room fetched successfully", data: { room } });
});

export const updateRoom = catchAsync(async (req: Request, res: Response) => {
  const room = await roomService.updateRoom(req.params.id, req.user!.id, req.user!.role, req.body);
  return sendSuccess(res, { message: "Room updated successfully", data: { room } });
});

export const deleteRoom = catchAsync(async (req: Request, res: Response) => {
  await roomService.deleteRoom(req.params.id, req.user!.id, req.user!.role);
  return sendSuccess(res, { message: "Room deleted successfully" });
});
