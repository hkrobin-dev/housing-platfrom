"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "Find me a cheap room",
  "How do applications work?",
  "How is rent paid?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your housing assistant. Ask me about available rooms, how applications work, rent, or roommate matching.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(preset?: string) {
    const text = (preset ?? input).trim();
    if (!text || sending) return;

    const nextMessages: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const { data } = await api.post("/assistant/chat", {
        message: text,
        history: nextMessages.slice(-10),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.data.reply }]);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't reach the assistant service right now." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="animate-slide-up mb-3 w-80 sm:w-96 h-[28rem] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600 to-emerald-500 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <span className="relative">
                <Bot size={18} />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-brand-600" />
              </span>
              Housing Assistant
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="hover:bg-white/20 rounded-lg p-1 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`flex animate-fade-in ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl whitespace-pre-wrap shadow-sm ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {messages.length <= 1 && !sending && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-100 px-2.5 py-1.5 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-2 flex items-center gap-2">
            <input
              className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Ask about rooms, rent, roommates..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={() => sendMessage()}
              disabled={sending}
              className="bg-brand-500 hover:bg-brand-600 text-white rounded-full p-2 disabled:opacity-50"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-gradient-to-br from-brand-500 to-emerald-500 hover:from-brand-600 hover:to-emerald-600 text-white rounded-full p-4 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Toggle chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
