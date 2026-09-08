import { z } from "zod";

export const createViewingRequestSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid(),
    roomId: z.string().uuid(),
    requestedDate: z.string().datetime(),
    note: z.string().max(300).optional(),
  }),
});

export const updateViewingStatusSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED", "COMPLETED"]),
  }),
});
