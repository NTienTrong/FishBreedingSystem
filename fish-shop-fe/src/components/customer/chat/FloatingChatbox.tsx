"use client";

import { useEffect, useRef, useState } from "react";

type ChatRole = "user" | "bot";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const API_URL = "/api/chat";

export default function FloatingChatbox() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content: "Xin chào! FishSync có thể tư vấn cá Koi, cá vàng và cách chăm hồ cho bạn nhé 🐟",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || typing) {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setTyping(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const reply = await response.text();
      setMessages((prev) => [...prev, { role: "bot", content: reply || "FishSync chưa phản hồi được lúc này 😊" }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", content: "FishSync đang bận, bạn thử lại sau nhé 😊" }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-70">
      {open ? (
        <div className="mb-4 w-87.5 h-112.5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-[#005B71] to-[#00A3C4] text-white">
            <div>
              <p className="text-sm font-bold leading-none">FishSync Support</p>
              <p className="text-[11px] opacity-85 mt-1">Tư vấn cá giống và chăm hồ</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
              aria-label="Đóng chat"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[linear-gradient(180deg,#f8fcfd_0%,#ffffff_100%)]">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-[#005B71] text-white rounded-br-md"
                      : "bg-slate-100 text-slate-700 rounded-bl-md"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-md px-3 py-2 text-sm bg-slate-100 text-slate-500 shadow-sm">
                  Đang trả lời...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 p-3 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                className="flex-1 resize-none rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#00A3C4] focus:ring-2 focus:ring-[#00A3C4]/15 min-h-11 max-h-28"
                rows={1}
                placeholder="Nhập câu hỏi của bạn..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                className="inline-flex items-center justify-center rounded-2xl bg-[#005B71] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#005B71]/25 hover:bg-[#004555] transition-colors"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-14 h-14 rounded-full bg-linear-to-br from-[#005B71] to-[#00A3C4] text-white shadow-[0_18px_50px_rgba(0,91,113,0.45)] flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Mở chat hỗ trợ"
      >
        <span className="material-symbols-outlined text-[26px]">chat</span>
      </button>
    </div>
  );
}
