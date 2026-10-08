import { randomUUID } from "crypto";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { initiateSslCommerzPayment, validateSslCommerzTransaction } from "../../config/sslcommerz";
import { env } from "../../config/env";
import { createNotification } from "../notification/notification.service";
import { sendEmail, paymentConfirmationEmailHtml } from "../../config/email";

interface InitPaymentInput {
  purpose: "RENT" | "DEPOSIT" | "UTILITY" | "SUBSCRIPTION";
  amount: number;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
}

export async function initiatePayment(input: InitPaymentInput) {
  const transactionId = `TXN-${randomUUID()}`;

  const payment = await prisma.payment.create({
    data: {
      userId: input.userId,
      purpose: input.purpose,
      amount: input.amount,
      gateway: "SSLCOMMERZ",
      status: "INITIATED",
      transactionId,
    },
  });

  const { gatewayUrl } = await initiateSslCommerzPayment({
    amount: input.amount,
    transactionId,
    customerName: input.userName,
    customerEmail: input.userEmail,
    customerPhone: input.userPhone,
    successUrl: `${env.API_BASE_URL}/api/v1/payments/success?tran_id=${transactionId}`,
    failUrl: `${env.API_BASE_URL}/api/v1/payments/fail?tran_id=${transactionId}`,
    cancelUrl: `${env.API_BASE_URL}/api/v1/payments/cancel?tran_id=${transactionId}`,
    ipnUrl: `${env.API_BASE_URL}/api/v1/payments/ipn`,
  });

  return { payment, gatewayUrl };
}

/**
 * Called from the success callback / IPN handler. Always re-validates with
 * SSLCommerz server-side (val_id) before trusting the "success" redirect —
 * a forged client-side hit to /success must never mark a payment as paid.
 */
export async function confirmPayment(transactionId: string, valId: string) {
  const payment = await prisma.payment.findUnique({ where: { transactionId } });
  if (!payment) throw ApiError.notFound("Payment record not found");

  const validation = await validateSslCommerzTransaction(valId);
  const isValid = validation?.status === "VALID" || validation?.status === "VALIDATED";

  const updated = await prisma.payment.update({
    where: { transactionId },
    data: {
      status: isValid ? "SUCCESS" : "FAILED",
      gatewayRefId: validation?.bank_tran_id || null,
    },
  });

  if (isValid) {
    // Link back to whichever domain record this payment was for
    await prisma.rentPayment.updateMany({
      where: { paymentId: payment.id },
      data: { status: "PAID" },
    });
    await prisma.utilityBillSplit.updateMany({
      where: { paymentId: payment.id },
      data: { status: "PAID" },
    });
    // Activate the plan subscription bought through /subscriptions/checkout
    const subscription = await prisma.subscription.findUnique({
      where: { paymentId: payment.id },
    });
    if (subscription && subscription.status === "PENDING") {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "ACTIVE", startDate, endDate },
      });
      // Auto-grant the purchased role: OWNER plan → OWNER, MANAGER plan → MANAGER.
      // Runs on every verified payment so the buyer never waits on a manual approval.
      // (Inline here instead of importing subscription.service — that module already
      // imports this one for checkout, so an import would be circular.)
      const buyer = await prisma.user.findUnique({ where: { id: payment.userId } });
      if (buyer && buyer.role !== "ADMIN" && buyer.role !== subscription.plan) {
        await prisma.user.update({ where: { id: buyer.id }, data: { role: subscription.plan } });
      }
    }
  }

  await createNotification(
    payment.userId,
    "GENERAL",
    isValid
      ? `Your ${payment.purpose.toLowerCase()} payment of ৳${payment.amount} was successful.`
      : `Your ${payment.purpose.toLowerCase()} payment could not be verified. Please try again.`
  ).catch(() => null);

  if (isValid) {
    const user = await prisma.user.findUnique({ where: { id: payment.userId } });
    if (user) {
      await sendEmail(
        user.email,
        "Payment Confirmation",
        paymentConfirmationEmailHtml(user.name, payment.purpose, Number(payment.amount))
      ).catch(() => null);
    }
  }

  return updated;
}

export async function markPaymentFailed(transactionId: string) {
  return prisma.payment.update({ where: { transactionId }, data: { status: "FAILED" } });
}

export async function markPaymentCancelled(transactionId: string) {
  return prisma.payment.update({ where: { transactionId }, data: { status: "CANCELLED" } });
}

export async function listMyPayments(userId: string) {
  return prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function getPaymentByTranId(userId: string, transactionId: string) {
  const payment = await prisma.payment.findUnique({
    where: { transactionId },
    include: {
      subscription: true,
      rentPayment: { include: { lease: { select: { id: true, roomId: true } } } },
      utilityBillSplit: {
        include: { utilityBill: { select: { id: true, billType: true, month: true } } },
      },
    },
  });
  if (!payment) throw ApiError.notFound("Payment record not found");
  if (payment.userId !== userId) throw ApiError.forbidden("You do not own this payment");
  return payment;
}