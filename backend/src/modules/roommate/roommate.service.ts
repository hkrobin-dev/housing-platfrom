import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";

interface RoommateProfileInput {
  budgetMin: number;
  budgetMax: number;
  gender?: string;
  occupation?: string;
  lifestyleTags?: string[];
  preferredLocation?: string;
  moveInDate?: string;
  bio?: string;
}

export async function upsertProfile(userId: string, input: RoommateProfileInput) {
  const data = { ...input, moveInDate: input.moveInDate ? new Date(input.moveInDate) : undefined };
  return prisma.roommateProfile.upsert({
    where: { userId },
    update: data,
    create: { ...data, userId, lifestyleTags: input.lifestyleTags ?? [] },
  });
}

export async function getProfile(userId: string) {
  const profile = await prisma.roommateProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound("Roommate profile not found");
  return profile;
}

/**
 * Simple, explainable weighted-scoring match algorithm (not ML):
 * - Budget overlap        → up to 40 points
 * - Preferred location    → up to 30 points (exact/substring match)
 * - Lifestyle tag overlap → up to 30 points (proportional to shared tags)
 */
export async function findMatches(userId: string, limit = 20) {
  const me = await getProfile(userId);

  const candidates = await prisma.roommateProfile.findMany({
    where: { userId: { not: userId } },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  const scored = candidates.map((c: any) => {
    let score = 0;

    // Budget overlap
    const overlap = Math.min(me.budgetMax, c.budgetMax) - Math.max(me.budgetMin, c.budgetMin);
    if (overlap > 0) {
      const range = Math.max(me.budgetMax - me.budgetMin, 1);
      score += Math.min(40, (overlap / range) * 40);
    }

    // Location
    if (
      me.preferredLocation &&
      c.preferredLocation &&
      me.preferredLocation.toLowerCase().trim() === c.preferredLocation.toLowerCase().trim()
    ) {
      score += 30;
    }

    // Lifestyle tags overlap
    const shared = me.lifestyleTags.filter((t: string) => c.lifestyleTags.includes(t));
    const union = new Set([...me.lifestyleTags, ...c.lifestyleTags]);
    if (union.size > 0) score += (shared.length / union.size) * 30;

    return { profile: c, score: Math.round(score) };
  });

  return scored
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Match a roommate seeker against available rooms — same weighted idea,
 * scoring rent-within-budget + location match.
 */
export async function findRoomMatches(userId: string, limit = 20) {
  const me = await getProfile(userId);

  const rooms = await prisma.room.findMany({
    where: { status: "AVAILABLE", isDeleted: false, rentAmount: { lte: me.budgetMax } },
    include: { property: true },
    take: 100,
  });

  const scored = rooms.map((room: any) => {
    let score = 0;
    const rent = Number(room.rentAmount);
    if (rent >= me.budgetMin && rent <= me.budgetMax) score += 50;
    else if (rent < me.budgetMax) score += 25;

    if (
      me.preferredLocation &&
      room.property.city &&
      room.property.city.toLowerCase().includes(me.preferredLocation.toLowerCase())
    ) {
      score += 50;
    }

    return { room, score: Math.round(score) };
  });

  return scored.sort((a: any, b: any) => b.score - a.score).slice(0, limit);
}
