import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { assertOwnership } from "../property/property.service";
import { initiatePayment } from "../payment/payment.service";

interface CreateBillInput {
  propertyId: string;
  billType: "ELECTRICITY" | "WATER" | "GAS" | "INTERNET" | "OTHER";
  totalAmount: number;
  month: string;
  tenantIds: string[];
}

/**
 * Creates the bill AND its per-tenant splits atomically — an even split by
 * default (totalAmount / number of tenants), rounded to 2 decimals with any
 * remainder absorbed by the first tenant so the splits always sum exactly.
 */
export async function createUtilityBillWithSplit(userId: string, role: string, input: CreateBillInput) {
  await assertOwnership(input.propertyId, userId, role);

  const shareBase = Math.floor((input.totalAmount / input.tenantIds.length) * 100) / 100;
  const remainder = Math.round((input.totalAmount - shareBase * input.tenantIds.length) * 100) / 100;

  return prisma.$transaction(async (tx: any) => {
    const bill = await tx.utilityBill.create({
      data: {
        propertyId: input.propertyId,
        billType: input.billType,
        totalAmount: input.totalAmount,
        month: input.month,
      },
    });

    const splits = await Promise.all(
      input.tenantIds.map((tenantId, index) =>
        tx.utilityBillSplit.create({
          data: {
            utilityBillId: bill.id,
            tenantId,
            shareAmount: index === 0 ? shareBase + remainder : shareBase,
          },
        })
      )
    );

    return { bill, splits };
  });
}

export async function listBillsForProperty(propertyId: string, userId: string, role: string) {
  await assertOwnership(propertyId, userId, role);
  return prisma.utilityBill.findMany({
    where: { propertyId },
    include: { splits: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listMySplits(tenantId: string) {
  return prisma.utilityBillSplit.findMany({
    where: { tenantId },
    include: { utilityBill: { include: { property: { select: { title: true, address: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function paySplit(splitId: string, tenantId: string, userEmail: string, userName: string) {
  const split = await prisma.utilityBillSplit.findUnique({ where: { id: splitId } });
  if (!split) throw ApiError.notFound("Bill split not found");
  if (split.tenantId !== tenantId) throw ApiError.forbidden("This bill split does not belong to you");
  if (split.status === "PAID") throw ApiError.badRequest("This bill has already been paid");

  const { payment, gatewayUrl } = await initiatePayment({
    purpose: "UTILITY",
    amount: Number(split.shareAmount),
    userId: tenantId,
    userEmail,
    userName,
  });

  await prisma.utilityBillSplit.update({ where: { id: splitId }, data: { paymentId: payment.id } });

  return { gatewayUrl };
}
