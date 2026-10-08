import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function ensureDemoUser(
  email: string,
  password: string,
  name: string,
  role: "ADMIN" | "OWNER" | "TENANT"
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Demo ${role} already exists: ${email}`);
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, password: hashedPassword, role, isVerified: true, provider: "LOCAL" },
  });
  console.log(`✅ Demo ${role} created: ${email} / ${password}`);
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@housing.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

  await ensureDemoUser(adminEmail, adminPassword, "Platform Admin", "ADMIN");
  // Fixed demo logins used by the frontend one-click Demo Login buttons.
  await ensureDemoUser("owner@housing.com", "Owner@12345", "Demo Owner", "OWNER");
  await ensureDemoUser("tenant@housing.com", "Tenant@12345", "Demo Tenant", "TENANT");

  console.log("✅ Demo seed complete. Demo logins:");
  console.log(`   Admin:  ${adminEmail} / ${adminPassword} (change after first login)`);
  console.log("   Owner:  owner@housing.com / Owner@12345");
  console.log("   Tenant: tenant@housing.com / Tenant@12345");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
