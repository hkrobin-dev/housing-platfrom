import { z } from "zod";

export const createUtilityBillSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid(),
    billType: z.enum(["ELECTRICITY", "WATER", "GAS", "INTERNET", "OTHER"]),
    totalAmount: z.number().positive(),
    month: z.string().regex(/^\d{4}-\d{2}$/, "month must be in YYYY-MM format"),
    tenantIds: z.array(z.string().uuid()).min(1, "At least one tenant is required to split the bill"),
  }),
});
