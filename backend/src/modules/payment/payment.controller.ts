import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import * as service from "./payment.service";
import { env } from "../../config/env";

export const listMyPayments = catchAsync(async (req: Request, res: Response) => {
  const payments = await service.listMyPayments(req.user!.id);
  return sendSuccess(res, { message: "Payments fetched successfully", data: { payments } });
});

// SSLCommerz posts x-www-form-urlencoded data to these callback endpoints
export const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
  const tranId = (req.query.tran_id as string) || req.body.tran_id;
  const valId = (req.query.val_id as string) || req.body.val_id;
  await service.confirmPayment(tranId, valId);
  return res.redirect(`${env.CLIENT_URL}/payments/success?tran_id=${tranId}`);
});

export const paymentFail = catchAsync(async (req: Request, res: Response) => {
  const tranId = (req.query.tran_id as string) || req.body.tran_id;
  await service.markPaymentFailed(tranId);
  return res.redirect(`${env.CLIENT_URL}/payments/fail?tran_id=${tranId}`);
});

export const paymentCancel = catchAsync(async (req: Request, res: Response) => {
  const tranId = (req.query.tran_id as string) || req.body.tran_id;
  await service.markPaymentCancelled(tranId);
  return res.redirect(`${env.CLIENT_URL}/payments/cancel?tran_id=${tranId}`);
});

// IPN (server-to-server notification) — same validation logic as success callback
export const paymentIpn = catchAsync(async (req: Request, res: Response) => {
  const tranId = req.body.tran_id;
  const valId = req.body.val_id;
  await service.confirmPayment(tranId, valId);
  return sendSuccess(res, { message: "IPN processed successfully" });
});
