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

export const updateMyProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().max(20).optional(),
    avatarUrl: z.string().url().max(500).optional(),
  }),
});
