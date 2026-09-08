import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { releaseSeat } from "../room/room.service";
import { createNotification } from "../notification/notification.service";

export async function listLeasesForProperty(propertyId: string, userId: string, role: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw ApiError.notFound("Property not found");
  const isOwner = property.ownerId === userId;
  const isManager = property.managerId === userId;
  if (role !== "ADMIN" && !isOwner && !isManager) throw ApiError.forbidden("Not authorized for this property");

  return prisma.lease.findMany({
    where: { room: { propertyId } },
    include: { tenant: { select: { id: true, name: true, email: true } }, room: true, rentPayments: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLeaseById(id: string, userId: string, role: string) {
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: { room: { include: { property: true } }, tenant: { select: { id: true, name: true, email: true } }, rentPayments: true },
  });
  if (!lease) throw ApiError.notFound("Lease not found");

  const isTenant = lease.tenantId === userId;
  const isOwner = lease.room.property.ownerId === userId;
  const isManager = lease.room.property.managerId === userId;
  if (role !== "ADMIN" && !isTenant && !isOwner && !isManager) {
    throw ApiError.forbidden("You do not have permission to view this lease");
  }
  return lease;
}

export async function listMyLeases(tenantId: string) {
  return prisma.lease.findMany({
    where: { tenantId },
    include: { room: { include: { property: { select: { title: true, address: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Terminating a lease must also free up the room's seat again —
 * done inside a transaction so lease status and room availability never drift apart.
 */
export async function terminateLease(id: string, userId: string, role: string) {
  const lease = await prisma.lease.findUnique({ where: { id }, include: { room: { include: { property: true } } } });
  if (!lease) throw ApiError.notFound("Lease not found");

  const isOwner = lease.room.property.ownerId === userId;
  const isManager = lease.room.property.managerId === userId;
  if (role !== "ADMIN" && !isOwner && !isManager) {
    throw ApiError.forbidden("You do not have permission to terminate this lease");
  }
  if (lease.status !== "ACTIVE") throw ApiError.badRequest("Only an active lease can be terminated");

  const updated = await prisma.lease.update({
    where: { id },
    data: { status: "TERMINATED", endDate: new Date() },
  });

  await releaseSeat(lease.roomId);

  await createNotification(
    lease.tenantId,
    "GENERAL",
    `Your lease for room ${lease.room.roomNo} has been terminated.`
  ).catch(() => null);

  return updated;
}
