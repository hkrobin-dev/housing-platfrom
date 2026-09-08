import { z } from "zod";

export const generateScheduleSchema = z.object({
  body: z.object({
    months: z.number().int().positive().max(24).default(12),
  }),
});
