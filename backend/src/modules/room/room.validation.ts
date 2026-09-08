import { z } from "zod";

export const createRoomSchema = z.object({
  body: z.object({
    roomNo: z.string().min(1, "Room number is required"),
    rentAmount: z.number().positive("Rent amount must be positive"),
    capacity: z.number().int().positive().optional(),
    roomType: z.enum(["SINGLE", "SHARED"]).optional(),
    availableFrom: z.string().datetime().optional(),
    seatsLeft: z.number().int().positive().optional(),
  }),
});

export const updateRoomSchema = z.object({
  body: z.object({
    roomNo: z.string().min(1).optional(),
    rentAmount: z.number().positive().optional(),
    capacity: z.number().int().positive().optional(),
    roomType: z.enum(["SINGLE", "SHARED"]).optional(),
    status: z.enum(["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE"]).optional(),
  }),
});
