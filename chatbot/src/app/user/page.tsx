"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatWindow() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "bot", text: "Hello! I'm your Mental Health Companion 💬" },
    { sender: "bot", text: "How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"ai" | "moderator">("ai"); // 👈 mode state
  const ws = useRef<WebSocket | null>(null);

  // connect WebSocket when in moderator mode
  useEffect(() => {
    if (mode === "moderator") {
      ws.current = new WebSocket("ws://localhost:3001"); // your backend WebSocket server
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          { sender: "moderator", text: data.message },
        ]);
      };
      ws.current.onclose = () => console.log("Disconnected from moderator");
    } else if (ws.current) {
      ws.current.close();
    }
  }, [mode]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);

    if (mode === "ai") {
      // send to AI backend
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } else if (mode === "moderator" && ws.current) {
      // send via WebSocket
      ws.current.send(JSON.stringify({ message: input }));
    }

    setInput("");
  };

  const handleLogout = () => {
    localStorage.clear(); // remove stored user info
    router.push("/"); // redirect to login page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-xl p-6 w-[500px] relative">
        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>

        <h1 className="text-xl font-bold text-center text-blue-600 mb-2">
          🧠 Mental Health Chatbot
        </h1>

        {/* MODE SWITCH BUTTON */}
        <div className="flex justify-center mb-4">
          <button
            className={`px-3 py-1 rounded-l-lg ${
              mode === "ai" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode("ai")}
          >
            AI Mode
          </button>
          <button
            className={`px-3 py-1 rounded-r-lg ${
              mode === "moderator" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode("moderator")}
          >
            Moderator Mode
          </button>
        </div>

        <div className="border p-3 rounded-lg h-64 overflow-y-auto bg-gray-100">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`my-2 ${
                msg.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block px-3 py-1 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : msg.sender === "moderator"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200"
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
