import { z } from "zod";

export const setBanStatusSchema = z.object({
  body: z.object({
    isBanned: z.boolean(),
  }),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(["ADMIN", "OWNER", "MANAGER", "TENANT"]),
  }),
});
