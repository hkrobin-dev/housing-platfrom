import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { assertOwnership } from "../property/property.service";
import { createNotification } from "../notification/notification.service";

export async function createViewingRequest(
  tenantId: string,
  input: { propertyId: string; roomId: string; requestedDate: string; note?: string }
) {
  const room = await prisma.room.findUnique({ where: { id: input.roomId } });
  if (!room || room.propertyId !== input.propertyId) throw ApiError.notFound("Room not found for this property");

  return prisma.viewingRequest.create({
    data: {
      tenantId,
      propertyId: input.propertyId,
      roomId: input.roomId,
      requestedDate: new Date(input.requestedDate),
      note: input.note,
    },
  });
}

export async function listMyViewingRequests(tenantId: string) {
  return prisma.viewingRequest.findMany({
    where: { tenantId },
    include: { room: true, property: { select: { id: true, title: true, address: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listPropertyViewingRequests(propertyId: string, userId: string, role: string) {
  await assertOwnership(propertyId, userId, role);
  return prisma.viewingRequest.findMany({
    where: { propertyId },
    include: { tenant: { select: { id: true, name: true, email: true, phone: true } }, room: true },
    orderBy: { requestedDate: "asc" },
  });
}

export async function updateViewingStatus(
  id: string,
  userId: string,
  role: string,
  status: "APPROVED" | "REJECTED" | "COMPLETED"
) {
  const viewing = await prisma.viewingRequest.findUnique({ where: { id } });
  if (!viewing) throw ApiError.notFound("Viewing request not found");
  await assertOwnership(viewing.propertyId, userId, role);

  const updated = await prisma.viewingRequest.update({ where: { id }, data: { status } });

  if (status === "APPROVED" || status === "REJECTED") {
    await createNotification(
      viewing.tenantId,
      "VIEWING_UPDATE",
      `Your viewing request has been ${status.toLowerCase()}.`
    ).catch(() => null);
  }

  return updated;
}
