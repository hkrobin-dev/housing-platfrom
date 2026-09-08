import { z } from "zod";

export const assignManagerSchema = z.object({
  body: z.object({
    email: z.string().email("A valid manager email is required"),
  }),
});
