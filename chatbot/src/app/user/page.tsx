"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";

type SocketType = ReturnType<typeof io>;
type Message = { sender: string; text: string; room?: string; username?: string };

export default function UserChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isModeratorMode, setIsModeratorMode] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<SocketType | null>(null);

  // ✅ Load username and room
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      const room = `room_${storedUser}`;
      setUsername(storedUser);
      setRoomId(room);

      // ✅ Fetch chat history from DB
      fetch(`/api/chats/${room}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (data && Array.isArray(data) && data.length > 0) {
            const formatted = data.map((m: any) => ({
              sender: m.sender,
              text: m.text,
              room: room,
              username: m.username,
            }));
            setMessages(formatted);
          } else {
            // If no history, show AI greeting
            setMessages([
              {
                sender: "ai",
                text: "Hi! I'm your chat assistant. How are you feeling today?",
              },
            ]);
          }
          setIsLoaded(true);
        })
        .catch((err) => {
          console.error("Error loading chat history:", err);
          setMessages([
            {
              sender: "ai",
              text: "Hi! I'm your chat assistant. How are you feeling today?",
            },
          ]);
          setIsLoaded(true);
        });
    } else {
      router.push("/");
    }
  }, [router]);

  // ✅ Socket setup for moderator mode
  useEffect(() => {
    if (!isModeratorMode || !roomId || !username) return;

    if (socketRef.current) {
      socketRef.current.off("receive_message");
      socketRef.current.disconnect();
    }

    const socket = io({
      path: "/api/socket",
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.emit("join_room", { roomId, username, role: "user" });
    console.log("🩺 Joined moderator room:", roomId);

    socket.on("receive_message", (data: Message) => {
      console.log("📩 Received:", data);
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [isModeratorMode, roomId, username]);

  // ✅ Save message to DB
  const saveMessageToDB = async (msg: Message) => {
    try {
      await fetch("/api/chats/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: roomId, // ✅ renamed to match backend expectation
          sender: msg.sender,
          text: msg.text,
          username: username,
        }),
      });
    } catch (err) {
      console.error("❌ Failed to save message:", err);
    }
  };

  // ✅ Send message handler
  const handleSend = async () => {
    if (!input.trim()) return;

    if (isModeratorMode && (!socketRef.current || !roomId)) {
      console.warn("⏳ Socket not ready yet — please wait...");
      return;
    }

    const userMsg: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    saveMessageToDB(userMsg); // 💾 save user message
    const lower = input.toLowerCase();

    // 🩺 Moderator Mode
    if (isModeratorMode && socketRef.current && roomId && username) {
      socketRef.current.emit("send_message", {
        room: roomId,
        sender: "user",
        text: input,
        username,
      });
      setInput("");
      return;
    }

    // 💬 AI Mode logic
    let aiResponse = "";
    if (
      !isModeratorMode &&
      (lower.includes("sad") ||
        lower.includes("depressed") ||
        lower.includes("anxious") ||
        lower.includes("unhappy"))
    ) {
      const geminiReply = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await geminiReply.json();
      aiResponse =
        data.reply +
        " 😔 I think it might help to talk with Dr. Moody. Would you like to switch to Moderator Mode?";
    } else if (["yes", "yeah", "okay", "sure"].some((w) => lower.includes(w))) {
      aiResponse = "Alright, I’ll transfer you to Dr. Moody now 🩺...";
      const aiMsg = { sender: "ai", text: aiResponse };
      setMessages((prev) => [...prev, aiMsg]);
      saveMessageToDB(aiMsg);

      // 🩺 Switch to Moderator Mode
      setTimeout(() => {
        setIsModeratorMode(true);
        const systemMsgs: Message[] = [
          { sender: "system", text: "Moderator has joined the conversation." },
          {
            sender: "moderator",
            text: "Hi, I'm Dr. Moody. How are you feeling today?",
          },
        ];
        setMessages((prev) => [...prev, ...systemMsgs]);
        systemMsgs.forEach(saveMessageToDB);
      }, 800);
      setInput("");
      return;
    } else {
      const geminiReply = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await geminiReply.json();
      aiResponse = data.reply;
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg = { sender: "ai", text: aiResponse };
      setMessages((prev) => [...prev, aiMsg]);
      saveMessageToDB(aiMsg); // 💾 save AI reply
    }, 800);
    setInput("");
  };

  // ✅ Switch back to AI mode
  const handleSwitchToAI = () => {
    setIsModeratorMode(false);
    const msgs: Message[] = [
      { sender: "system", text: `Welcome back, ${username}! 👋` },
      { sender: "ai", text: "Hi again! How are you feeling now?" },
    ];
    setMessages((prev) => [...prev, ...msgs]);
    msgs.forEach(saveMessageToDB);
  };

  // ✅ Logout
  const handleLogout = () => {
    router.push("/");
  };

  const formatMessageText = (text: string) =>
    text
      .replace(/(\d+\.)\s*/g, "\n$1 ")
      .replace(/(^|\n)([*-])\s+/g, "\n$2 ")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .trim();

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-xl p-4 w-[700px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-center text-pink-600">
            🧠 {isModeratorMode ? "Dr. Moody (Moderator Mode)" : "Dr. Chatty (AI Mode)"}
          </h1>
          <div className="flex gap-2">
            {isModeratorMode && (
              <button
                onClick={handleSwitchToAI}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                Switch to AI
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Chat Window */}
        <div className="border p-3 rounded-lg h-[600px] overflow-y-auto mb-3 space-y-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-3 py-2 rounded-lg max-w-[80%] ${
                  m.sender === "user"
                    ? "bg-blue-500 text-white"
                    : m.sender === "moderator"
                    ? "bg-green-300 text-gray-800"
                    : m.sender === "system"
                    ? "bg-gray-300 text-gray-800 italic"
                    : "bg-purple-200 text-gray-900"
                }`}
              >
                {m.sender === "ai" ? (
                  <div
                    className="whitespace-pre-wrap font-sans leading-relaxed text-sm"
                    dangerouslySetInnerHTML={{ __html: formatMessageText(m.text) }}
                  />
                ) : (
                  <div className="font-sans leading-relaxed text-sm">{m.text}</div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-purple-100 text-gray-700 px-3 py-2 rounded-lg italic animate-pulse">
                Dr. Chatty is typing<span className="animate-ping">...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <input
            className="border p-2 rounded-lg flex-grow"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
