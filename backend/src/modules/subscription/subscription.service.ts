import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { initiatePayment } from "../payment/payment.service";
import { PLANS, PlanKey } from "./plans";
import type { SubscriptionPlan } from "@prisma/client";

export async function checkout(userId: string, plan: PlanKey) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  // One active subscription per plan — no double-paying for the same month.
  const existing = await prisma.subscription.findFirst({
    where: { userId, plan, status: "ACTIVE", endDate: { gt: new Date() } },
  });
  if (existing) throw ApiError.badRequest(`You already have an active ${PLANS[plan].label} plan`);

  const catalog = PLANS[plan];

  const subscription = await prisma.subscription.create({
    data: { userId, plan, amount: catalog.amount, status: "PENDING" },
  });

  const { payment, gatewayUrl } = await initiatePayment({
    purpose: "SUBSCRIPTION",
    amount: catalog.amount,
    userId,
    userEmail: user.email,
    userName: user.name,
    userPhone: user.phone || undefined,
  });

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { paymentId: payment.id },
  });

  return { subscriptionId: subscription.id, gatewayUrl };
}

export async function mySubscription(userId: string) {
  const [active, history] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE", endDate: { gt: new Date() } },
      orderBy: { endDate: "desc" },
    }),
    prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);
  return { active, history };
}

/**
 * Auto-grant helper: give the buyer the role they paid for
 * (OWNER plan → OWNER, MANAGER plan → MANAGER). ADMIN accounts are never
 * touched, and an already-correct role is left alone.
 */
export async function grantPlanRole(userId: string, plan: SubscriptionPlan) {
  const buyer = await prisma.user.findUnique({ where: { id: userId } });
  if (!buyer || buyer.role === "ADMIN" || buyer.role === plan) return buyer;
  return prisma.user.update({ where: { id: userId }, data: { role: plan } });
}

// Admin: everyone who requested / paid for a plan, newest first.
export async function listAllSubscriptions(status?: string, plan?: string) {
  return prisma.subscription.findMany({
    where: {
      ...(status ? { status: status as "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED" } : {}),
      ...(plan ? { plan: plan as SubscriptionPlan } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      payment: {
        select: {
          id: true,
          status: true,
          amount: true,
          transactionId: true,
          gatewayRefId: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

// Admin: manually approve a PENDING subscription (e.g. gateway callback was
// delayed). Activates 30 days + grants the plan role, same as auto-approve.
// Idempotent: on an already-ACTIVE subscription it just re-syncs the plan role
// (covers payments verified before auto-grant existed).
export async function approveSubscription(id: string) {
  const sub = await prisma.subscription.findUnique({ where: { id } });
  if (!sub) throw ApiError.notFound("Subscription not found");

  let updated = sub;
  if (sub.status === "PENDING") {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    updated = await prisma.subscription.update({
      where: { id },
      data: { status: "ACTIVE", startDate, endDate },
    });
  }
  await grantPlanRole(sub.userId, sub.plan);
  return updated;
}
