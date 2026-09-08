import { z } from "zod";

export const createMaintenanceSchema = z.object({
  body: z.object({
    roomId: z.string().uuid(),
    title: z.string().min(3),
    description: z.string().min(5),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  }),
});

export const updateMaintenanceStatusSchema = z.object({
  body: z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
  }),
});
