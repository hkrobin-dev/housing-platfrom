import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as service from "./assistant.service";

export const chat = catchAsync(async (req: Request, res: Response) => {
  const { message, history } = req.body;
  const result = await service.chatWithAssistant(req.user?.id, message, history);
  return sendSuccess(res, { message: "Assistant replied successfully", data: result });
});
