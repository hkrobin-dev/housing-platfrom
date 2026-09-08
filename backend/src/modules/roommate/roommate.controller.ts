import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as roommateService from "./roommate.service";

export const upsertProfile = catchAsync(async (req: Request, res: Response) => {
  const profile = await roommateService.upsertProfile(req.user!.id, req.body);
  return sendSuccess(res, { message: "Roommate profile saved successfully", data: { profile } });
});

export const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const profile = await roommateService.getProfile(req.user!.id);
  return sendSuccess(res, { message: "Roommate profile fetched successfully", data: { profile } });
});

export const getRoommateMatches = catchAsync(async (req: Request, res: Response) => {
  const matches = await roommateService.findMatches(req.user!.id, req.query.limit ? Number(req.query.limit) : undefined);
  return sendSuccess(res, { message: "Roommate matches fetched successfully", data: { matches } });
});

export const getRoomMatches = catchAsync(async (req: Request, res: Response) => {
  const matches = await roommateService.findRoomMatches(req.user!.id, req.query.limit ? Number(req.query.limit) : undefined);
  return sendSuccess(res, { message: "Room matches fetched successfully", data: { matches } });
});
