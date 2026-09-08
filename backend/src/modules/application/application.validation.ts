import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    roomId: z.string().uuid(),
    message: z.string().max(500).optional(),
  }),
});

export const reviewApplicationSchema = z.object({
  body: z.object({
    status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED"]),
  }),
});
