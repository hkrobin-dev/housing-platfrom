import axios from "axios";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/apiError";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

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
 * Calls Gemini via the Generative Language REST API. Optionally grounds the
 * answer with a lightweight snapshot of currently available rooms so
 * recommendations are based on real listings, not hallucinated ones.
 */
export async function chatWithAssistant(userId: string | undefined, message: string, history: ChatMessage[] = []) {
  if (!GEMINI_API_KEY) {
    throw ApiError.internal("AI assistant is not configured. Set GEMINI_API_KEY in .env");
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

  // Gemini uses "model" instead of "assistant", requires the first message to be
  // from the user, and prefers alternating roles — normalize the history.
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
  for (const h of history) {
    const role = h.role === "assistant" ? "model" : "user";
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n${h.content}`;
    } else {
      contents.push({ role, parts: [{ text: h.content }] });
    }
  }
  while (contents.length > 0 && contents[0].role !== "user") contents.shift();
  const last = contents[contents.length - 1];
  if (last && last.role === "user") {
    last.parts[0].text += `\n${message}`;
  } else {
    contents.push({ role: "user", parts: [{ text: message }] });
  }

  let data;
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT + contextBlock }] },
        contents,
        generationConfig: { maxOutputTokens: 600 },
      },
      {
        headers: {
          "x-goog-api-key": GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    data = res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const apiMessage =
        (err.response?.data as { error?: { message?: string } })?.error?.message || err.message;
      if (status === 400 || status === 401 || status === 403) {
        throw ApiError.internal(`AI assistant request rejected (${status}): ${apiMessage}`);
      }
      if (status === 429) {
        throw ApiError.internal("AI assistant is rate-limited right now, please try again shortly.");
      }
      throw ApiError.internal(`AI assistant request failed: ${apiMessage}`);
    }
    throw err;
  }

  const reply =
    data.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || "")
      .join("")
      .trim() || "";
  return { reply };
}
