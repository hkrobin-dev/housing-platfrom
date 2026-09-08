import { prisma } from "../../config/db";

export async function createNotification(userId: string, type: string, message: string) {
  return prisma.notification.create({ data: { userId, type: type as never, message } });
}

export async function listMyNotifications(userId: string) {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
}

export async function markAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}
