"use client";

import ChatWidget from "@/src/components/chat/ChatWidget";

export default function ChatLauncher() {
  return (
    <ChatWidget
      brandHex="#00ffff"
      greeting="Hi! I’m Martin Painting’s assistant. Need a quote or have a question?"
    />
  );
}
