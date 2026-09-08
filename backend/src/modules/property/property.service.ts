import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { cached, invalidateCache } from "../../config/redis";

interface CreatePropertyInput {
  title: string;
  description?: string;
  address: string;
  city?: string;
  geoLat?: number;
  geoLng?: number;
  type?: "APARTMENT" | "HOUSE" | "HOSTEL" | "STUDIO";
  amenities?: string[];
  managerId?: string;
}

export async function createProperty(ownerId: string, input: CreatePropertyInput) {
  const property = await prisma.property.create({
    data: { ...input, ownerId },
  });
  await invalidateCache("properties:list:*");
  return property;
}

export async function listProperties(query: {
  city?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const cacheKey = `properties:list:${query.city || "all"}:${query.type || "all"}:${page}:${limit}`;

  return cached(cacheKey, 30, async () => {
    const where: Record<string, unknown> = {
      isDeleted: false,
      status: "ACTIVE",
      ...(query.city && { city: { equals: query.city, mode: "insensitive" } }),
      ...(query.type && { type: query.type }),
    };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { rooms: { where: { isDeleted: false } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.property.count({ where }),
    ]);

    return { properties, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  });
}

export async function listMyProperties(userId: string, role: string) {
  const where =
    role === "ADMIN"
      ? { isDeleted: false }
      : { isDeleted: false, OR: [{ ownerId: userId }, { managerId: userId }] };

  return prisma.property.findMany({
    where,
    include: { rooms: { where: { isDeleted: false }, include: { availability: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPropertyById(id: string) {
  const property = await prisma.property.findFirst({
    where: { id, isDeleted: false },
    include: { rooms: { where: { isDeleted: false }, include: { availability: true } }, owner: { select: { id: true, name: true, email: true } } },
  });
  if (!property) throw ApiError.notFound("Property not found");
  return property;
}

export async function getActiveTenantsForProperty(propertyId: string, userId: string, role: string) {
  await assertOwnership(propertyId, userId, role);

  const leases = await prisma.lease.findMany({
    where: { room: { propertyId }, status: "ACTIVE" },
    include: { tenant: { select: { id: true, name: true, email: true } }, room: { select: { roomNo: true } } },
  });

  return leases.map((l: any) => ({ ...l.tenant, roomNo: l.room.roomNo, leaseId: l.id }));
}

/**
 * Assigns a manager to a property by their email. Only the property's owner (or admin)
 * can do this. The target user is looked up and auto-promoted to MANAGER role if they
 * were a plain TENANT — an OWNER assigning themselves elsewhere or an ADMIN is rejected
 * to avoid confusing role overlaps.
 */
export async function assignManager(propertyId: string, ownerId: string, ownerRole: string, managerEmail: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw ApiError.notFound("Property not found");
  if (ownerRole !== "ADMIN" && property.ownerId !== ownerId) {
    throw ApiError.forbidden("Only the property owner can assign a manager");
  }

  const targetUser = await prisma.user.findUnique({ where: { email: managerEmail } });
  if (!targetUser) throw ApiError.notFound("No user found with that email");
  if (targetUser.role === "ADMIN") throw ApiError.badRequest("Cannot assign an admin as a property manager");
  if (targetUser.id === property.ownerId) throw ApiError.badRequest("Owner cannot also be the manager");

  if (targetUser.role === "TENANT") {
    await prisma.user.update({ where: { id: targetUser.id }, data: { role: "MANAGER" } });
  }

  return prisma.property.update({ where: { id: propertyId }, data: { managerId: targetUser.id } });
}

export async function removeManager(propertyId: string, ownerId: string, ownerRole: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw ApiError.notFound("Property not found");
  if (ownerRole !== "ADMIN" && property.ownerId !== ownerId) {
    throw ApiError.forbidden("Only the property owner can remove a manager");
  }
  return prisma.property.update({ where: { id: propertyId }, data: { managerId: null } });
}

export async function assertOwnership(propertyId: string, userId: string, userRole: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw ApiError.notFound("Property not found");
  const isOwner = property.ownerId === userId;
  const isManager = property.managerId === userId;
  if (userRole !== "ADMIN" && !isOwner && !isManager) {
    throw ApiError.forbidden("You do not have permission to manage this property");
  }
  return property;
}

export async function updateProperty(id: string, data: Partial<CreatePropertyInput> & { status?: string }) {
  const property = await prisma.property.update({ where: { id }, data: data as never });
  await invalidateCache("properties:list:*");
  return property;
}

export async function deleteProperty(id: string) {
  // Soft delete to preserve audit trail
  const property = await prisma.property.update({ where: { id }, data: { isDeleted: true, status: "INACTIVE" } });
  await invalidateCache("properties:list:*");
  return property;
}

export async function addPropertyImages(id: string, urls: string[]) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw ApiError.notFound("Property not found");
  return prisma.property.update({
    where: { id },
    data: { images: { push: urls } },
  });
}
