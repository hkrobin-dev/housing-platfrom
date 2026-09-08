import { z } from "zod";

export const upsertRoommateProfileSchema = z.object({
  body: z.object({
    budgetMin: z.number().nonnegative(),
    budgetMax: z.number().positive(),
    gender: z.string().optional(),
    occupation: z.string().optional(),
    lifestyleTags: z.array(z.string()).optional(),
    preferredLocation: z.string().optional(),
    moveInDate: z.string().datetime().optional(),
    bio: z.string().max(500).optional(),
  }).refine((d) => d.budgetMax >= d.budgetMin, {
    message: "budgetMax must be greater than or equal to budgetMin",
    path: ["budgetMax"],
  }),
});
