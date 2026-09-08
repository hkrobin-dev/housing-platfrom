import axios from "axios";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are the in-app assistant for a Housing & Roommate Management Platform.
You help users: find properties/rooms that match their budget and area, understand how
the application/viewing/lease process works, understand rent and utility-bill splitting,
and general housing/roommate advice. Be concise, friendly, and practical. If asked about
something outside housing/roommate topics, politely redirect back to how you can help
with their housing search or account.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Calls Claude via the Anthropic Messages API. Optionally grounds the answer
 * with a lightweight snapshot of currently available rooms so recommendations
 * are based on real listings, not hallucinated ones.
 */
export async function chatWithAssistant(userId: string | undefined, message: string, history: ChatMessage[] = []) {
  if (!ANTHROPIC_API_KEY) {
    throw ApiError.internal("AI assistant is not configured. Set ANTHROPIC_API_KEY in .env");
  }

  // Ground with a small snapshot of available rooms so the assistant can make real suggestions
  const availableRooms = await prisma.room.findMany({
    where: { status: "AVAILABLE", isDeleted: false },
    take: 15,
    include: { property: { select: { title: true, city: true, address: true } } },
  });

  const context = availableRooms
    .map(
      (r: any) =>
        `- ${r.property.title} (${r.property.city ?? r.property.address}): room ${r.roomNo}, ৳${r.rentAmount}/month, ${r.roomType.toLowerCase()}, capacity ${r.capacity}`
    )
    .join("\n");

  const contextBlock = context
    ? `\n\nHere are some currently available rooms you can reference when relevant:\n${context}`
    : "";

  const messages = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: message },
  ];

  const { data } = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT + contextBlock,
      messages,
    },
    {
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
    }
  );

  const reply = data.content?.find((c: { type: string }) => c.type === "text")?.text || "";
  return { reply };
}
