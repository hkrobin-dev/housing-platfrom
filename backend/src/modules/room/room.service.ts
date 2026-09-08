import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { assertOwnership } from "../property/property.service";

interface CreateRoomInput {
  roomNo: string;
  rentAmount: number;
  capacity?: number;
  roomType?: "SINGLE" | "SHARED";
  availableFrom?: string;
  seatsLeft?: number;
}

// Creating a room + its initial availability slot in a single transaction
export async function createRoom(propertyId: string, userId: string, role: string, input: CreateRoomInput) {
  await assertOwnership(propertyId, userId, role);

  const capacity = input.capacity ?? 1;

  return prisma.$transaction(async (tx: any) => {
    const room = await tx.room.create({
      data: {
        propertyId,
        roomNo: input.roomNo,
        rentAmount: input.rentAmount,
        capacity,
        roomType: input.roomType ?? "SINGLE",
      },
    });

    await tx.availability.create({
      data: {
        roomId: room.id,
        availableFrom: input.availableFrom ? new Date(input.availableFrom) : new Date(),
        seatsLeft: input.seatsLeft ?? capacity,
      },
    });

    return room;
  });
}

export async function listRoomsByProperty(propertyId: string) {
  return prisma.room.findMany({
    where: { propertyId, isDeleted: false },
    include: { availability: true },
    orderBy: { roomNo: "asc" },
  });
}

export async function getRoomById(id: string) {
  const room = await prisma.room.findFirst({
    where: { id, isDeleted: false },
    include: { availability: true, property: true },
  });
  if (!room) throw ApiError.notFound("Room not found");
  return room;
}

export async function updateRoom(id: string, userId: string, role: string, data: Partial<CreateRoomInput> & { status?: string }) {
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) throw ApiError.notFound("Room not found");
  await assertOwnership(room.propertyId, userId, role);

  return prisma.room.update({ where: { id }, data: data as never });
}

export async function deleteRoom(id: string, userId: string, role: string) {
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) throw ApiError.notFound("Room not found");
  await assertOwnership(room.propertyId, userId, role);

  return prisma.room.update({ where: { id }, data: { isDeleted: true, status: "MAINTENANCE" } });
}

/**
 * TRANSACTION-SAFE availability update.
 * Uses a Prisma interactive transaction with an atomic conditional update
 * (seatsLeft decrement only succeeds if seatsLeft > 0), preventing two
 * concurrent requests from both succeeding when only 1 seat remains.
 */
export async function reserveSeat(roomId: string) {
  return prisma.$transaction(async (tx: any) => {
    const availability = await tx.availability.findFirst({ where: { roomId } });
    if (!availability) throw ApiError.notFound("Availability record not found for this room");

    // Atomic conditional decrement — updateMany returns count=0 if condition fails,
    // which is how we detect the race condition instead of trusting a prior read.
    const result = await tx.availability.updateMany({
      where: { id: availability.id, seatsLeft: { gt: 0 } },
      data: { seatsLeft: { decrement: 1 } },
    });

    if (result.count === 0) {
      throw ApiError.conflict("No seats left in this room — someone else just took the last spot");
    }

    const updatedAvailability = await tx.availability.findUnique({ where: { id: availability.id } });
    const newSeatsLeft = updatedAvailability!.seatsLeft;

    // If seats are fully booked, flip room status to OCCUPIED; otherwise keep AVAILABLE
    await tx.room.update({
      where: { id: roomId },
      data: { status: newSeatsLeft === 0 ? "OCCUPIED" : "AVAILABLE" },
    });

    return updatedAvailability;
  });
}

export async function releaseSeat(roomId: string) {
  return prisma.$transaction(async (tx: any) => {
    const availability = await tx.availability.findFirst({ where: { roomId } });
    if (!availability) throw ApiError.notFound("Availability record not found for this room");

    const room = await tx.room.findUnique({ where: { id: roomId } });
    const cap = room?.capacity ?? 1;
    const newSeats = Math.min(availability.seatsLeft + 1, cap);

    await tx.availability.update({ where: { id: availability.id }, data: { seatsLeft: newSeats } });
    await tx.room.update({ where: { id: roomId }, data: { status: "AVAILABLE" } });
  });
}
