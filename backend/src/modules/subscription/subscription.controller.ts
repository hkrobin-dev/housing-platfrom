import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as service from "./subscription.service";
import { PlanKey } from "./plans";

export const checkout = catchAsync(async (req: Request, res: Response) => {
  const { gatewayUrl, subscriptionId } = await service.checkout(
    req.user!.id,
    req.body.plan as PlanKey
  );
  return sendSuccess(res, {
    message: "Subscription checkout initiated successfully",
    data: { subscriptionId, gatewayUrl },
  });
});

export const mySubscription = catchAsync(async (req: Request, res: Response) => {
  const data = await service.mySubscription(req.user!.id);
  return sendSuccess(res, { message: "Subscription fetched successfully", data });
});

export const listAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const subscriptions = await service.listAllSubscriptions(
    req.query.status as string | undefined,
    req.query.plan as string | undefined
  );
  return sendSuccess(res, { message: "Subscriptions fetched successfully", data: { subscriptions } });
});

export const approveSubscription = catchAsync(async (req: Request, res: Response) => {
  const subscription = await service.approveSubscription(req.params.id);
  return sendSuccess(res, { message: "Subscription approved successfully", data: { subscription } });
});
