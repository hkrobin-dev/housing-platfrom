import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { assertOwnership } from "../property/property.service";
import { createNotification } from "../notification/notification.service";

export async function applyToRoom(tenantId: string, roomId: string, message?: string) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room || room.isDeleted) throw ApiError.notFound("Room not found");
  if (room.status === "OCCUPIED") throw ApiError.badRequest("This room is already fully occupied");

  // Prevent duplicate pending applications by the same tenant (unique constraint also enforces this at DB level)
  const existing = await prisma.application.findFirst({
    where: { tenantId, roomId, status: { in: ["PENDING", "UNDER_REVIEW"] } },
  });
  if (existing) throw ApiError.conflict("You already have a pending application for this room");

  return prisma.application.create({
    data: { tenantId, roomId, message },
  });
}

export async function listMyApplications(tenantId: string) {
  return prisma.application.findMany({
    where: { tenantId },
    include: { room: { include: { property: { select: { title: true, address: true } } } }, lease: true },
    orderBy: { appliedAt: "desc" },
  });
}

export async function listApplicationsForOwner(propertyId: string, userId: string, role: string) {
  await assertOwnership(propertyId, userId, role);
  return prisma.application.findMany({
    where: { room: { propertyId } },
    include: { tenant: { select: { id: true, name: true, email: true, phone: true } }, room: true },
    orderBy: { appliedAt: "desc" },
  });
}

/**
 * CORE TRANSACTION-SAFE WORKFLOW:
 * Approving an application must atomically:
 *   1. Verify a seat is still available (conditional decrement, race-safe)
 *   2. Mark this application APPROVED
 *   3. Auto-reject other pending applications for the same room (optional business rule)
 *   4. Create the Lease record
 * All of this happens inside one Prisma $transaction — if the seat reservation
 * fails (room got taken by someone else in the meantime), the whole operation rolls back.
 */
export async function reviewApplication(
  applicationId: string,
  reviewerId: string,
  role: string,
  status: "UNDER_REVIEW" | "APPROVED" | "REJECTED"
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { room: true },
  });
  if (!application) throw ApiError.notFound("Application not found");
  await assertOwnership(application.room.propertyId, reviewerId, role);

  if (status !== "APPROVED") {
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status, reviewedBy: reviewerId, reviewedAt: new Date() },
    });
    if (status === "REJECTED") {
      await createNotification(
        application.tenantId,
        "APPLICATION_STATUS",
        `Your application for room ${application.room.roomNo} was rejected.`
      ).catch(() => null); // notification failure should never block the core workflow
    }
    return updated;
  }

  // status === "APPROVED" → run the full transaction
  return prisma.$transaction(async (tx: any) => {
    const availability = await tx.availability.findFirst({ where: { roomId: application.roomId } });
    if (!availability) throw ApiError.notFound("Availability record not found for this room");

    // Atomic conditional decrement — this is what makes it race-condition-safe
    const seatUpdate = await tx.availability.updateMany({
      where: { id: availability.id, seatsLeft: { gt: 0 } },
      data: { seatsLeft: { decrement: 1 } },
    });
    if (seatUpdate.count === 0) {
      throw ApiError.conflict("No seats left — this room was just filled by another approved application");
    }

    const updatedAvailability = await tx.availability.findUnique({ where: { id: availability.id } });
    await tx.room.update({
      where: { id: application.roomId },
      data: { status: updatedAvailability!.seatsLeft === 0 ? "OCCUPIED" : "AVAILABLE" },
    });

    const approvedApplication = await tx.application.update({
      where: { id: applicationId },
      data: { status: "APPROVED", reviewedBy: reviewerId, reviewedAt: new Date() },
    });

    const lease = await tx.lease.create({
      data: {
        applicationId,
        tenantId: application.tenantId,
        roomId: application.roomId,
        startDate: new Date(),
        rentAmount: application.room.rentAmount,
        depositAmount: application.room.rentAmount, // 1 month deposit by default; adjust as needed
      },
    });

    // Auto-reject other still-pending applications for this room
    await tx.application.updateMany({
      where: {
        roomId: application.roomId,
        id: { not: applicationId },
        status: { in: ["PENDING", "UNDER_REVIEW"] },
      },
      data: { status: "REJECTED", reviewedBy: reviewerId, reviewedAt: new Date() },
    });

    return { application: approvedApplication, lease };
  }).then(async (result: any) => {
    // Notifications sent after the transaction commits (never inside it — a notification
    // failure must never roll back a successful lease creation)
    await createNotification(
      application.tenantId,
      "APPLICATION_STATUS",
      `Your application for room ${application.room.roomNo} was approved! Your lease has started.`
    ).catch(() => null);
    return result;
  });
}
