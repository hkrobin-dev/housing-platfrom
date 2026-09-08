import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { createNotification } from "../notification/notification.service";

export async function createMaintenanceRequest(
  tenantId: string,
  input: { roomId: string; title: string; description: string; priority?: string }
) {
  const room = await prisma.room.findUnique({ where: { id: input.roomId }, include: { property: true } });
  if (!room) throw ApiError.notFound("Room not found");

  const request = await prisma.maintenanceRequest.create({
    data: {
      tenantId,
      roomId: input.roomId,
      title: input.title,
      description: input.description,
      priority: (input.priority as never) ?? "MEDIUM",
    },
  });

  const notifyTargetId = room.property.managerId || room.property.ownerId;
  await createNotification(
    notifyTargetId,
    "MAINTENANCE_UPDATE",
    `New maintenance request for room ${room.roomNo}: "${input.title}"`
  ).catch(() => null);

  return request;
}

export async function listMyMaintenanceRequests(tenantId: string) {
  return prisma.maintenanceRequest.findMany({
    where: { tenantId },
    include: { room: { include: { property: { select: { title: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listMaintenanceForProperty(propertyId: string, userId: string, role: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw ApiError.notFound("Property not found");
  const isOwner = property.ownerId === userId;
  const isManager = property.managerId === userId;
  if (role !== "ADMIN" && !isOwner && !isManager) throw ApiError.forbidden("Not authorized for this property");

  return prisma.maintenanceRequest.findMany({
    where: { room: { propertyId } },
    include: { tenant: { select: { id: true, name: true, email: true } }, room: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateMaintenanceStatus(id: string, userId: string, role: string, status: string) {
  const req = await prisma.maintenanceRequest.findUnique({ where: { id }, include: { room: { include: { property: true } } } });
  if (!req) throw ApiError.notFound("Maintenance request not found");
  const isOwner = req.room.property.ownerId === userId;
  const isManager = req.room.property.managerId === userId;
  if (role !== "ADMIN" && !isOwner && !isManager) throw ApiError.forbidden("Not authorized for this request");

  const updated = await prisma.maintenanceRequest.update({ where: { id }, data: { status: status as never } });

  await createNotification(
    req.tenantId,
    "MAINTENANCE_UPDATE",
    `Your maintenance request "${req.title}" is now ${status.replace("_", " ").toLowerCase()}.`
  ).catch(() => null);

  return updated;
}
