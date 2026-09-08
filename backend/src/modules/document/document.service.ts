import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";

export async function uploadDocument(userId: string, fileUrl: string, fileName: string, type: string, leaseId?: string) {
  return prisma.document.create({
    data: { userId, fileUrl, fileName, type: type as never, leaseId },
  });
}

export async function listMyDocuments(userId: string) {
  return prisma.document.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function getDocument(id: string, userId: string, role: string) {
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) throw ApiError.notFound("Document not found");
  if (role !== "ADMIN" && doc.userId !== userId) throw ApiError.forbidden("Not authorized to access this document");
  return doc;
}

export async function deleteDocument(id: string, userId: string, role: string) {
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) throw ApiError.notFound("Document not found");
  if (role !== "ADMIN" && doc.userId !== userId) throw ApiError.forbidden("Not authorized to delete this document");
  await prisma.document.delete({ where: { id } });
}
