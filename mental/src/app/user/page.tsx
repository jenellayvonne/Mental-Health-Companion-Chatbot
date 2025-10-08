"use client";

import { useState } from "react";

export default function UserChatPage() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm your Mental Health Companion 💬 How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // handle send message
  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessage = { sender: "user", text: input };
    setMessages([...messages, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botReply = { sender: "bot", text: data.reply || "Sorry, I didn’t understand that." };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 flex flex-col">
        <h1 className="text-2xl font-semibold text-center mb-4 text-blue-600">
          🧠 Mental Health Chatbot
        </h1>

        {/* Chat window */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-3 border rounded-md bg-gray-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg max-w-xs ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-200 text-gray-900 self-start mr-auto"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="text-gray-500 italic text-sm">Gemini is thinking...</div>
          )}
        </div>

        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
