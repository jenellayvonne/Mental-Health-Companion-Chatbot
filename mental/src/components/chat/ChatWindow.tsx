'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initial AI message
    setMessages([
      {
        id: 'initial-ai-message',
        text: "Welcome to Your Mental Health Companion! I'm here to provide support, listen to your concerns, and help you navigate your mental wellness journey. Feel free to share what's on your mind.",
        sender: 'AI',
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      text: input,
      sender: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input, conversationId }),
    });

    if (res.ok) {
        const { aiMessage, conversationId: newConversationId } = await res.json();
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        if (!conversationId) {
          setConversationId(newConversationId);
        }
    } else {
        console.error("Failed to get AI response");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-4 h-full">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 my-2 rounded-lg max-w-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            ))}
        </div>
      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-lg p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-transparent outline-none text-gray-700"
              placeholder="Share what's on your mind... I'm here to listen and support you."
            />
            <button
              onClick={sendMessage}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
        </div>
      </div>
    </div>
  );
}
