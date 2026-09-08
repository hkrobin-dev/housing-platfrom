import { z } from "zod";

export const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message is required").max(1000),
    history: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      )
      .max(20)
      .optional(),
  }),
});
