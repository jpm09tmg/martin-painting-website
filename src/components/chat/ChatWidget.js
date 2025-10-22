"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { X, Send, MessageCircle, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function ChatWidget({
  greeting = "Hi! I’m the Martin Painting assistant. How can I help?",
  zIndex = 50,
  brandHex = "#74A744",
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append, // may be undefined
    setInput,
  } = useChat({
    api: "/api/chat",
    maxAutomaticRoundTrips: 3,
    initialMessages: [
      { id: "sys-welcome", role: "assistant", content: greeting },
    ],
  });

  // Fallback local state in case the SDK doesn't give us a change handler
  const [localInput, setLocalInput] = useState("");

  const effectiveInput = typeof input === "string" ? input : localInput;

  const effectiveOnChange =
    typeof handleInputChange === "function"
      ? handleInputChange
      : (e) => {
          setLocalInput(e.target.value);
          if (typeof setInput === "function") setInput(e.target.value);
        };

  const safeInput = typeof input === "string" ? input : "";

  useEffect(() => {
    if (error) console.error("useChat error:", error);
  }, [error]);

  // Focus textarea when opened
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusable = panelRef.current.querySelector("textarea");
    if (focusable) focusable.focus();
  }, [open]);

  // Close with ESC key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const bubble = useMemo(
    () =>
      clsx(
        "rounded-2xl px-4 py-2 text-sm leading-relaxed max-w-[85%] shadow-sm",
        "whitespace-pre-wrap"
      ),
    []
  );

  return (
    <>
      {/* Floating launcher button */}
      <button
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen(!open)}
        style={{ zIndex }}
        className={clsx(
          "fixed bottom-5 right-5 h-14 w-14 rounded-full shadow-lg flex items-center justify-center",
          "transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2",
          "text-white"
        )}
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: brandHex }}
        />
        <span className="relative">{open ? <X /> : <MessageCircle />}</span>
      </button>

      {/* Chat panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site chat"
        style={{ zIndex }}
        className={clsx(
          "fixed bottom-24 right-5 w-[92vw] sm:w-[380px] max-h-[70vh]",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          ref={panelRef}
          className={clsx(
            "bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden",
            "transition-all duration-200",
            open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: isLoading ? brandHex : "#22c55e" }}
              />
              <p className="text-sm font-semibold">Martin Painting Assistant</p>
            </div>
            <button
              className="p-1 rounded-md hover:bg-gray-100"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Messages */}
          <div className="px-4 py-3 overflow-auto flex-1 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%3232%22 fill=%22none%22><rect width=%2232%22 height=%2232%22 fill=%22%23ffffff%22/><path d=%22M16 0v32M0 16h32%22 stroke=%22%23f2f2f2%22 stroke-width=%221%22/></svg>')]">
            <ul className="flex flex-col gap-2">
              {messages.map((m) => (
                <li key={m.id} className="flex">
                  {m.role === "user" ? (
                    <div className="ml-auto">
                      <div className={bubble} style={{ background: "#eef6ff" }}>
                        {m.content}
                      </div>
                    </div>
                  ) : (
                    <div className="mr-auto">
                      <div className={bubble} style={{ background: "#f7f7f7" }}>
                        {m.content}
                      </div>
                    </div>
                  )}
                </li>
              ))}
              {isLoading && (
                <li className="mr-auto">
                  <div className={bubble} style={{ background: "#f7f7f7" }}>
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking…
                    </span>
                  </div>
                </li>
              )}
            </ul>
          </div>
          {/* Quick suggestions */}
          <div className="px-3 pb-2 pt-1 flex flex-wrap gap-2">
            {[
              "Get a quote",
              "Interior vs exterior pricing",
              "Book a consultation",
            ].map((q) => (
              <button
                key={q}
                onClick={async () => {
                  // If append exists, one-tap send; otherwise just prefill the box
                  if (typeof append === "function") {
                    // Native SDK path
                    await append({ role: "user", content: q });
                  } else {
                    // Fallback: put it into the input and auto-submit
                    if (typeof setInput === "function") setInput(q);
                    else setLocalInput(q);
                    // small microtask so input state updates before submit
                    queueMicrotask(() => {
                      const fakeEvent = { preventDefault: () => {} };
                      if (typeof handleSubmit === "function")
                        handleSubmit(fakeEvent);
                      else {
                        // Manual send fallback (same as above)
                        fetch("/api/chat", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            messages: [
                              ...messages,
                              {
                                role: "user",
                                content: q,
                                id: crypto.randomUUID?.() || String(Date.now()),
                              },
                            ],
                          }),
                        }).catch(console.error);
                      }
                    });
                  }
                }}
                className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50"
              >
                {q}
              </button>
            ))}
          </div>
          {/* Input field */}
          <form
            onSubmit={(e) => {
              // Always prevent the browser reload
              e.preventDefault();
              // If the SDK provided a handler, use it
              if (typeof handleSubmit === "function") {
                return handleSubmit(e);
              }
              // Otherwise do a minimal manual send so the chat still works
              (async () => {
                try {
                  const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      messages, // from useChat
                    }),
                  });
                  // If you want to show the echo in UI when SDK isn't managing state:
                  // const reader = res.body.getReader(); // (stream handling optional)
                  // For a simple fallback you could also just clear input:
                  if (typeof setInput === "function") setInput("");
                } catch (err) {
                  console.error("Manual send failed:", err);
                }
              })();
            }}
            className="border-t border-gray-200 p-2 flex items-end gap-2"
          >
            <textarea
              name="input"
              value={effectiveInput}
              onChange={effectiveOnChange}
              placeholder="Type your message…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />

            <button
              type="submit"
              disabled={isLoading || !effectiveInput.trim()}
              className={clsx(
                "rounded-xl px-3 py-2 text-sm text-white flex items-center gap-1 disabled:opacity-60 transition-colors"
              )}
              style={{ backgroundColor: brandHex }}
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
