import { z } from "zod";

export const terminateLeaseSchema = z.object({
  body: z.object({
    reason: z.string().max(300).optional(),
  }),
});
