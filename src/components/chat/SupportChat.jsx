"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/src/lib/db/supabase-client";
import { Send, Loader2, User, Shield } from "lucide-react";
import { useAuth } from "@/src/app/providers/AuthProvider";

export default function SupportChat({ isFullPage = false }) {
  const { session } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clientId, setClientId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  // Load client ID and messages
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadClientData = async () => {
      try {
        // Get client ID
        const { data: clientData } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (clientData) {
          setClientId(clientData.id);
          await loadMessages(clientData.id);
        }
      } catch (error) {
        console.error("Error loading client data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [session]);

  // Load messages
  const loadMessages = async (cId) => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("client_id", cId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel(`support_messages:${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !clientId) return;

    setSending(true);
    try {
      const { error } = await supabase.from("support_messages").insert([
        {
          client_id: clientId,
          message: text,
          sender_type: "client",
          is_read: false,
        },
      ]);

      if (error) throw error;
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-center p-4">
        <p>Please log in to chat with support</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isFullPage ? "h-full" : "h-96"}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-text-muted py-8">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-2">
              Send a message to start chatting with our support team
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_type === "client" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.sender_type === "client"
                    ? "bg-primary text-white"
                    : "bg-background-light border border-border text-text"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.sender_type === "admin" ? (
                    <Shield className="w-3 h-3" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  <span className="text-xs opacity-75">
                    {msg.sender_type === "admin" ? "Support Team" : "You"}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className="border-t border-border p-3 flex items-end gap-2"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Type your message..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-border px-3 py-2 text-sm bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="rounded-lg px-4 py-2 bg-primary text-white hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}

