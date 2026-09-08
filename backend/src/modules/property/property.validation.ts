import { z } from "zod";

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    address: z.string().min(5, "Address is required"),
    city: z.string().optional(),
    geoLat: z.number().optional(),
    geoLng: z.number().optional(),
    type: z.enum(["APARTMENT", "HOUSE", "HOSTEL", "STUDIO"]).optional(),
    amenities: z.array(z.string()).optional(),
    managerId: z.string().uuid().optional(),
  }),
});

export const updatePropertySchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    address: z.string().min(5).optional(),
    city: z.string().optional(),
    geoLat: z.number().optional(),
    geoLng: z.number().optional(),
    type: z.enum(["APARTMENT", "HOUSE", "HOSTEL", "STUDIO"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    amenities: z.array(z.string()).optional(),
    managerId: z.string().uuid().nullable().optional(),
  }),
});
