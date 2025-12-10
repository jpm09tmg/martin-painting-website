"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react"; 
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import clsx from "clsx";


export default function ChatWidget({
  greeting = "Hi! I’m the Martin Painting assistant. How can I help?",
  brandHex = "#74A744",
  zIndex = 50,
  suggestions = [
    "Get a quote",
    "Interior vs exterior pricing",
    "Book a consultation",
  ],
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const textareaRef = useRef(null);
  const [input, setInput] = useState("");

  // useChat from the working test page
  const { messages, sendMessage, isLoading, error } = useChat({
    api: "/api/chat",
    maxAutomaticRoundTrips: 3,
  });

  // Auto-focus the textarea when panel opens
  useEffect(() => {
    if (open && textareaRef.current) textareaRef.current.focus();
  }, [open]);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Simple autoresize for the textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [input]);

  // Log any hook error (kept quiet in UI)
  useEffect(() => {
    if (error) console.error("useChat error:", error);
  }, [error]);

  const onSubmit = (e) => {
    e.preventDefault();
    const text = (input ?? "").trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <>
      {/* Launcher button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full d-shadow flex items-center justify-center bg-primary text-white"
        style={{ backgroundColor: zIndex }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Chat assistant"
        aria-modal="true"
        className={clsx(
          "fixed bottom-24 right-6 w-[min(92vw,600px)] h-[min(92vh,600px)] max-h-[70vh] ",
          "bg-background-dark text-text",
          "rounded-2xl shadow-2xl border border-border",
          "flex flex-col overflow-hidden transition-transform",
          open ? "scale-100" : "scale-0",
        )}
        style={{ zIndex }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-background-light border-b border-border text-2xl">
          <div className="font-semibold">Chat with us</div>
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {/* UI-only greeting when empty */}
          {!messages.length && (
            <Bubble roleLabel="AI" tone="assistant">
              {greeting}
            </Bubble>
          )}

          {messages.map((m) => (
            <Bubble key={m.id} roleLabel={m.role === "user" ? "You" : "AI"} tone={m.role}>
              {Array.isArray(m.parts)
                ? m.parts.map((part, i) => (
                    part.type === "text" ? <span key={`${m.id}-${i}`}>{part.text}</span> : null
                  ))
                : ("text" in m && m.text ? m.text : (m.content ?? ""))}
            </Bubble>
          ))}

          {/* Loading indicator bubble */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking…
            </div>
          )}
        </div>

        {/* Quick suggestions */}
        {suggestions?.length > 0 && (
          <div className="px-3 pb-2 pt-1 flex flex-wrap gap-2 border-t border-border-muted ">
            {suggestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage({ text: q })}
                className="text-xs px-3 py-1.5 rounded-full border border-border-muted  hover:bg-background-light focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-0"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form onSubmit={onSubmit} className="border-t border-border-muted p-2 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input ?? ""}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border px-3 py-2 text-sm bg-background-light focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-0"
          />
          <button
            type="submit"
            disabled={!((input ?? "").trim()) || isLoading}
            className="rounded-xl px-3 py-2 text-sm text-white flex items-center gap-1 disabled:opacity-60"
            style={{ backgroundColor: brandHex }}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </>
  );
}

function Bubble({ children, roleLabel, tone }) {
  const isUser = tone === "user";
  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-lg",
          isUser
            ? "bg-background-light text-secondary border border-border-muted"
            : "bg-background text-text border border-border",
        )}
      >
        {roleLabel && (
          <div className="text-[10px] opacity-60 mb-1 select-none">{roleLabel}</div>
        )}
        {children}
      </div>
    </div>
  );
}
