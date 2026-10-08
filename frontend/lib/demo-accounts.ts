import { ShieldCheck, KeyRound, Home } from "lucide-react";

// Demo credentials — seeded by `npm run seed` in backend/ (see backend/prisma/seed.ts).
// Kept in lib/ (not a page) because App Router pages may only export route values.
export const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    description: "Manage users, view analytics & reports",
    icon: ShieldCheck,
    email: "admin@housing.com",
    password: "Admin@12345",
  },
  {
    role: "Owner",
    description: "List properties, review applications",
    icon: Home,
    email: "owner@housing.com",
    password: "Owner@12345",
  },
  {
    role: "Tenant",
    description: "Browse rooms, apply & pay rent",
    icon: KeyRound,
    email: "tenant@housing.com",
    password: "Tenant@12345",
  },
] as const;
