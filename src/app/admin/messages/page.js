"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  User,
  Mail,
  Phone,
  Search,
  Loader2,
  Shield,
  CheckCircle,
  Circle,
} from "lucide-react";
import { supabase } from "../../../lib/db/supabase-client";

const AdminMessages = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom
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

  // Load clients with message counts (only once on mount)
  useEffect(() => {
    loadClients();
  }, []);

  // Set up real-time subscription for all messages (separate from client loading)
  useEffect(() => {
    const allMessagesChannel = supabase
      .channel('all_support_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
        },
        (payload) => {
          // Update client list when new messages arrive
          setClients((prevClients) =>
            prevClients.map((client) => {
              if (client.id === payload.new.client_id) {
                // If this is the currently selected client and message is from them, don't increment unread
                const isCurrentlyViewing = selectedClient?.id === client.id;
                const isFromClient = payload.new.sender_type === 'client';
                
                return {
                  ...client,
                  messageCount: (client.messageCount || 0) + 1,
                  unreadCount: (isCurrentlyViewing && isFromClient) 
                    ? client.unreadCount 
                    : (isFromClient ? (client.unreadCount || 0) + 1 : client.unreadCount),
                  lastMessage: payload.new.message,
                  lastMessageTime: payload.new.created_at,
                };
              }
              return client;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(allMessagesChannel);
    };
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      // Only show loading on initial load, not on refreshes
      if (clients.length === 0) {
        setLoading(true);
      }

      // Get all clients with their user data
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, first_name, last_name, email, phone, user_id")
        .order("first_name", { ascending: true });

      if (clientsError) throw clientsError;

      // Get message counts and unread counts for each client
      const clientsWithCounts = await Promise.all(
        clientsData.map(async (client) => {
          const { data: messagesData } = await supabase
            .from("support_messages")
            .select("id, is_read, sender_type")
            .eq("client_id", client.id);

          const unreadCount = messagesData?.filter(
            (msg) => msg.sender_type === "client" && !msg.is_read
          ).length || 0;

          const { data: lastMessage } = await supabase
            .from("support_messages")
            .select("message, created_at")
            .eq("client_id", client.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...client,
            messageCount: messagesData?.length || 0,
            unreadCount,
            lastMessage: lastMessage?.message || null,
            lastMessageTime: lastMessage?.created_at || null,
          };
        })
      );

      // Filter to only show clients with messages or sort those with messages first
      const sortedClients = clientsWithCounts.sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        if (a.messageCount !== b.messageCount) {
          return b.messageCount - a.messageCount;
        }
        if (a.lastMessageTime && b.lastMessageTime) {
          return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        }
        return 0;
      });

      setClients(sortedClients);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected client
  const loadMessages = async (clientId) => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error details:", error);
        throw error;
      }
      setMessages(data || []);

      // Mark unread messages as read
      await supabase
        .from("support_messages")
        .update({ is_read: true })
        .eq("client_id", clientId)
        .eq("sender_type", "client")
        .eq("is_read", false);

      // Update the specific client's unread count to 0
      setClients((prevClients) =>
        prevClients.map((client) =>
          client.id === clientId
            ? { ...client, unreadCount: 0 }
            : client
        )
      );
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Set up real-time subscription for selected client's messages
  useEffect(() => {
    if (!selectedClient) return;

    const channel = supabase
      .channel(`support_messages:${selectedClient.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `client_id=eq.${selectedClient.id}`,
        },
        (payload) => {
          // Add message to the chat
          setMessages((current) => [...current, payload.new]);

          // Mark new client messages as read immediately since chat is open
          if (payload.new.sender_type === "client") {
            supabase
              .from("support_messages")
              .update({ is_read: true })
              .eq("id", payload.new.id);
          }
          // Note: Client list update is handled by the "all messages" subscription
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClient]);

  // Handle client selection
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    loadMessages(client.id);
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !selectedClient) return;

    setSending(true);
    try {
      const { error } = await supabase.from("support_messages").insert([
        {
          client_id: selectedClient.id,
          message: text,
          sender_type: "admin",
          is_read: true,
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

  // Filter clients by search term
  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.first_name?.toLowerCase().includes(searchLower) ||
      client.last_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Support Messages</h1>
          <p className="text-text-muted">Chat with customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Left Column - Clients List */}
        <div className="lg:col-span-1 bg-background-light border border-border rounded-lg overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-text bg-background border border-border-muted rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Clients List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center text-text-muted p-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className={`w-full text-left p-4 border-b border-border hover:bg-background transition-colors ${
                    selectedClient?.id === client.id
                      ? "bg-background border-l-4 border-l-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <span className="font-medium text-text">
                        {client.first_name} {client.last_name}
                      </span>
                    </div>
                    {client.unreadCount > 0 && (
                      <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5 font-medium">
                        {client.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted truncate">
                    {client.email}
                  </p>
                  {client.lastMessage && (
                    <p className="text-xs text-text-muted truncate mt-1">
                      {client.lastMessage}
                    </p>
                  )}
                  {client.messageCount > 0 && (
                    <p className="text-xs text-text-muted mt-1">
                      {client.messageCount} message{client.messageCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Chat Area */}
        <div className="lg:col-span-2 bg-background-light border border-border rounded-lg overflow-hidden flex flex-col">
          {selectedClient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text">
                      {selectedClient.first_name} {selectedClient.last_name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {selectedClient.email}
                      </div>
                      {selectedClient.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedClient.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-text-muted py-8">
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-2">
                      Start the conversation with {selectedClient.first_name}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_type === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.sender_type === "admin"
                            ? "bg-primary text-white"
                            : "bg-background border border-border text-text"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {msg.sender_type === "admin" ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          <span className="text-xs opacity-75">
                            {msg.sender_type === "admin"
                              ? "You (Admin)"
                              : selectedClient.first_name}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.message}
                        </p>
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a client to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;

