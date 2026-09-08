import { prisma } from "../../config/db";

export async function getOwnerDashboard(ownerId: string) {
  const [totalProperties, totalRooms, occupiedRooms, pendingApplications, activeLeases, revenueAgg] =
    await Promise.all([
      prisma.property.count({ where: { ownerId, isDeleted: false } }),
      prisma.room.count({ where: { property: { ownerId }, isDeleted: false } }),
      prisma.room.count({ where: { property: { ownerId }, status: "OCCUPIED" } }),
      prisma.application.count({ where: { room: { property: { ownerId } }, status: { in: ["PENDING", "UNDER_REVIEW"] } } }),
      prisma.lease.count({ where: { room: { property: { ownerId } }, status: "ACTIVE" } }),
      prisma.rentPayment.aggregate({
        where: { lease: { room: { property: { ownerId } } }, status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  return {
    totalProperties,
    totalRooms,
    occupiedRooms,
    occupancyRate,
    pendingApplications,
    activeLeases,
    totalRevenueCollected: revenueAgg._sum.amount || 0,
  };
}

export async function getAdminDashboard() {
  const [totalUsers, totalProperties, totalRooms, totalLeases, totalRevenueAgg, usersByRole] = await Promise.all([
    prisma.user.count(),
    prisma.property.count({ where: { isDeleted: false } }),
    prisma.room.count({ where: { isDeleted: false } }),
    prisma.lease.count(),
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
  ]);

  return {
    totalUsers,
    totalProperties,
    totalRooms,
    totalLeases,
    totalRevenue: totalRevenueAgg._sum.amount || 0,
    usersByRole: usersByRole.map((r: any) => ({ role: r.role, count: r._count.role })),
  };
}
