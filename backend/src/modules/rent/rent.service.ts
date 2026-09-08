import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { initiatePayment } from "../payment/payment.service";

function formatMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Generates N months of rent schedule for a lease inside a single transaction,
 * using createMany + skipDuplicates so re-running it is idempotent (won't
 * create duplicate rows for a month that already has a RentPayment).
 */
export async function generateRentSchedule(leaseId: string, userId: string, role: string, months: number) {
  const lease = await prisma.lease.findUnique({ where: { id: leaseId }, include: { room: { include: { property: true } } } });
  if (!lease) throw ApiError.notFound("Lease not found");

  const isOwner = lease.room.property.ownerId === userId;
  const isManager = lease.room.property.managerId === userId;
  if (role !== "ADMIN" && !isOwner && !isManager) throw ApiError.forbidden("Not authorized for this lease");

  const start = new Date(lease.startDate);
  const rows = Array.from({ length: months }).map((_, i) => {
    const due = new Date(start.getFullYear(), start.getMonth() + i, 5); // due on the 5th of each month
    return {
      leaseId,
      month: formatMonth(due),
      amount: lease.rentAmount,
      dueDate: due,
    };
  });

  return prisma.rentPayment.createMany({ data: rows, skipDuplicates: true });
}

export async function listRentPaymentsForLease(leaseId: string, userId: string, role: string) {
  const lease = await prisma.lease.findUnique({ where: { id: leaseId }, include: { room: { include: { property: true } } } });
  if (!lease) throw ApiError.notFound("Lease not found");

  const isTenant = lease.tenantId === userId;
  const isOwner = lease.room.property.ownerId === userId;
  const isManager = lease.room.property.managerId === userId;
  if (role !== "ADMIN" && !isTenant && !isOwner && !isManager) throw ApiError.forbidden("Not authorized for this lease");

  return prisma.rentPayment.findMany({ where: { leaseId }, orderBy: { dueDate: "asc" } });
}

export async function payRent(rentPaymentId: string, userId: string, userEmail: string, userName: string) {
  const rentPayment = await prisma.rentPayment.findUnique({ where: { id: rentPaymentId }, include: { lease: true } });
  if (!rentPayment) throw ApiError.notFound("Rent payment record not found");
  if (rentPayment.lease.tenantId !== userId) throw ApiError.forbidden("This rent record does not belong to you");
  if (rentPayment.status === "PAID") throw ApiError.badRequest("This rent has already been paid");

  const { payment, gatewayUrl } = await initiatePayment({
    purpose: "RENT",
    amount: Number(rentPayment.amount),
    userId,
    userEmail,
    userName,
  });

  await prisma.rentPayment.update({ where: { id: rentPaymentId }, data: { paymentId: payment.id } });

  return { gatewayUrl };
}

// Called by a scheduled job (cron) to flag overdue rent — not wired to a live cron here,
// but exposed as a callable function for that purpose.
export async function markOverdueRents() {
  return prisma.rentPayment.updateMany({
    where: { status: "PENDING", dueDate: { lt: new Date() } },
    data: { status: "OVERDUE" },
  });
}
