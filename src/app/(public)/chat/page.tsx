'use client';

import { useChat } from '@ai-sdk/react';
import React from 'react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  return (
    <div className="flex flex-col w-full max-w-md min-h-screen mx-auto bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
           <span className="font-semibold mr-1">
             {message.role === 'user' ? 'User:' : 'AI:'}
           </span>
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return (
                   <span key={`${message.id}-${i}`}>{part.text}</span>
                 );
            }
          })}
        </div>
      ))}
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          type="text"
          className="fixed left-1/2 -translate-x-1/2 bottom-0 w-full max-w-md p-2 mb-8
                     border border-zinc-300 dark:border-zinc-800 rounded shadow-xl
                     bg-white dark:bg-zinc-800
                    text-zinc-900 dark:text-zinc-100
                     placeholder-zinc-400"
          value={input}
          placeholder="Say something..."
          onChange={e => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}