"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

type SocketType = ReturnType<typeof io>;
type Message = { sender: string; text: string; room: string; username?: string };
type ChatPreview = { id: string; user: string; msg: string };

export default function ModeratorDashboard() {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentChats, setRecentChats] = useState<ChatPreview[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // ✅ Prevent multiple socket setups
  const socketRef = useRef<SocketType | null>(null);

  // ✅ Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Restore previous chat on reload
  useEffect(() => {
    const savedRoom = localStorage.getItem("lastRoom");
    const savedUser = localStorage.getItem("lastUser");
    if (savedRoom && savedUser) {
      setCurrentRoom(savedRoom);
      setSelectedUser(savedUser);
    }
  }, []);

  // ✅ Fetch existing chats when the page loads
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch("/api/chats");
        if (res.ok) {
          const data = await res.json();
          setRecentChats(
            data.map((chat: any) => ({
              id: chat.id,
              user: chat.users?.[0] || "Unknown",
              msg: chat.lastMessage || "",
            }))
          );
        }
      } catch (error) {
        console.error("❌ Failed to fetch chats:", error);
      }
    };

    fetchChats();
  }, []);

  // ✅ Socket setup (looping fix applied)
  useEffect(() => {
    if (socketRef.current) return; // 🧠 Prevent multiple socket setups

    const setupSocket = async () => {
      await fetch("/api/socket");
      const newSocket = io({ path: "/api/socket", transports: ["websocket"] });
      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("✅ Moderator connected:", newSocket.id);

        // 🔁 Rejoin last room automatically after reload
        if (currentRoom) {
          newSocket.emit("join_room", { roomId: currentRoom, username: "Dr. Moody" });
        }
      });

      // 🔁 Load previous messages from server
      newSocket.on("load_messages", (msgs: Message[]) => {
        console.log("📜 Loaded previous messages:", msgs);
        setMessages(msgs);
      });

      // Receive messages
      newSocket.on("receive_message", (data: Message) => {
        console.log("📨 Received:", data);

        if (data.sender === "ai") return;

        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) =>
              m.text === data.text &&
              m.sender === data.sender &&
              m.room === data.room
          );
          if (isDuplicate) return prev;
          if (data.room === currentRoom) return [...prev, data];
          return prev;
        });

        setRecentChats((prev) => {
          const exists = prev.some((chat) => chat.id === data.room);
          if (exists) {
            return prev.map((chat) =>
              chat.id === data.room ? { ...chat, msg: data.text } : chat
            );
          }
          return [
            ...prev,
            { id: data.room, user: data.username || "Unknown", msg: data.text },
          ];
        });
      });

      // New chat notification
      newSocket.on("new_chat_message", (data: any) => {
        console.log("🆕 New chat notification:", data);

        // 💡 Only update chat list, not message list
        setRecentChats((prev) => {
          const exists = prev.some((chat) => chat.id === data.room);
          if (exists) {
            return prev.map((chat) =>
              chat.id === data.room ? { ...chat, msg: data.msg } : chat
            );
          }
          return [
            ...prev,
            { id: data.room, user: data.username || "Unknown", msg: data.msg },
          ];
        });
      });
    };

    setupSocket();

    // ✅ Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive_message");
        socketRef.current.off("new_chat_message");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentRoom]);

  // ✅ Join chat room
  const joinRoom = async (room: string, username: string) => {
    if (!socket) return;
    setCurrentRoom(room);
    setSelectedUser(username);
    setMessages([]);

    localStorage.setItem("lastRoom", room);
    localStorage.setItem("lastUser", username);

    socket.emit("join_room", { roomId: room, username: "Dr. Moody" });
    console.log(`🩺 Joined room: ${room}`);

    try {
      const res = await fetch(`/api/chats/${room}?role=moderator`);
      if (res.ok) {
        const oldMessages = await res.json();
        setMessages(oldMessages);
      }
    } catch (err) {
      console.error("❌ Failed to load chat history:", err);
    }
  };

  // ✅ Send message
  const handleSend = () => {
    if (!input.trim() || !currentRoom || !socket) return;
    const newMsg: Message = {
      sender: "moderator",
      text: input,
      room: currentRoom,
      username: "Dr. Moody",
    };
    setMessages((prev) => [...prev, newMsg]);
    socket.emit("send_message", newMsg);
    setInput("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 🧩 Sidebar */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <h2 className="text-xl font-bold text-center py-4 bg-pink-600 text-white">
          🩺 Dr. Moody Clients
        </h2>

        {recentChats.length === 0 ? (
          <p className="text-center text-gray-500 mt-6">No active chats yet.</p>
        ) : (
          <ul>
            {recentChats.map((chat) => (
              <li
                key={`${chat.id}-${chat.user}`} // ✅ FIXED: unique key
                onClick={() => joinRoom(chat.id, chat.user)}
                className={`p-3 border-b cursor-pointer hover:bg-pink-100 ${
                  currentRoom === chat.id ? "bg-pink-200" : ""
                }`}
              >
                <p className="font-semibold">{chat.user}</p>
                <p className="text-sm text-gray-600 truncate">{chat.msg}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 💬 Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            <div className="bg-white shadow p-4 flex justify-between items-center">
              <h2 className="font-bold text-lg text-pink-700">
                Chat with {selectedUser}
              </h2>
              <p className="text-gray-500 text-sm">
                Room ID: <span className="font-mono">{currentRoom}</span>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.sender === "moderator" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg max-w-[75%] ${
                      m.sender === "moderator"
                        ? "bg-green-300 text-gray-800"
                        : "bg-blue-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{m.text}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            <div className="bg-white p-4 flex gap-2 border-t">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-grow border p-2 rounded-lg"
              />
              <button
                onClick={handleSend}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg font-medium">Select a user chat to begin 🧠</p>
          </div>
        )}
      </div>
    </div>
  );
}
