import type { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const config = { api: { bodyParser: false } };

// Track when moderator joined each room
const moderatorJoinTimes: Record<string, Date> = {};

type NextResWithSocket = NextApiResponse & {
  socket: {
    server: {
      io?: Server;
    };
  };
};

export default async function handler(req: NextApiRequest, res: NextResWithSocket) {
  if (res.socket.server.io) {
    console.log("✅ Socket.IO already running");
    res.end();
    return;
  }

  console.log("🧠 Starting Socket.IO server...");
  const io = new Server(res.socket.server as any, {
    path: "/api/socket",
    addTrailingSlash: false,
  });

  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    /**
     * 🏠 JOIN ROOM EVENT
     */
    socket.on(
      "join_room",
      async ({ roomId, username, role }: { roomId: string; username?: string; role?: string }) => {
        socket.join(roomId);
        socket.data.role = role || (username === "Dr. Moody" ? "moderator" : "user");

        console.log(`👤 ${username || "Unknown"} joined ${roomId} as ${socket.data.role}`);

        // 🕒 Record moderator join time (once per room)
        if (socket.data.role === "moderator") {
          moderatorJoinTimes[roomId] = new Date();
          console.log(`🕒 Moderator joined ${roomId} at ${moderatorJoinTimes[roomId].toISOString()}`);
        }

        try {
          const chat = await prisma.chat.findUnique({
            where: { roomName: roomId },
            include: { messages: { orderBy: { createdAt: "asc" } } },
          });

          if (chat?.messages?.length) {
            let filteredMessages = chat.messages;

            // ✅ Filter messages for moderator: only show after they joined, exclude AI
            if (socket.data.role === "moderator") {
              const joinTime = moderatorJoinTimes[roomId];
              filteredMessages = chat.messages.filter(
                (m) => m.sender !== "ai" && (!joinTime || m.createdAt >= joinTime)
              );
            }

            socket.emit("load_messages", filteredMessages);
          }
        } catch (err) {
          console.error("❌ Error loading messages for room:", roomId, err);
        }
      }
    );

    /**
     * 💬 SEND MESSAGE EVENT
     */
    socket.on(
      "send_message",
      async (data: { room: string; sender: string; text: string; username?: string }) => {
        try {
          const { room, sender, text, username } = data;
          if (!room || !text) return;

          // Ensure chat exists
          let chat = await prisma.chat.findUnique({ where: { roomName: room } });
          if (!chat) chat = await prisma.chat.create({ data: { roomName: room } });

          // Ensure user exists
          const user = await prisma.user.upsert({
            where: { username: username || "Unknown" },
            update: {},
            create: { username: username || "Unknown", password: "placeholder" },
          });

          // Ensure user-chat link exists
          const link = await prisma.userChat.findFirst({
            where: { userId: user.id, chatId: chat.id },
          });
          if (!link) await prisma.userChat.create({ data: { userId: user.id, chatId: chat.id } });

          // Save message
          const message = await prisma.message.create({
            data: { chatId: chat.id, sender, text, username: username || user.username },
          });

          /**
           * 🚫 AI → Only User
           */
          if (sender === "ai") {
            io.to(room)
              .fetchSockets()
              .then((sockets) => {
                sockets.forEach((s) => {
                  if (s.data?.role === "user") {
                    s.emit("receive_message", message);
                  }
                });
              });
            return;
          }

          /**
           * 👤 USER → Moderator
           * Only send once after moderator joined
           */
          if (sender === "user") {
            const joinTime = moderatorJoinTimes[room];

            // ✅ Send message only to moderator sockets in that room
            io.to(room)
              .fetchSockets()
              .then((sockets) => {
                sockets.forEach((s) => {
                  if (
                    s.data?.role === "moderator" &&
                    (!joinTime || message.createdAt >= joinTime)
                  ) {
                    s.emit("receive_message", message);
                  }
                });
              });

            // ✅ Only update the sidebar chat list (not resend to active chat)
            io.emit("new_chat_message", {
              room,
              username: message.username,
              msg: message.text,
            });
          }

          /**
           * 🩺 MODERATOR → User
           */
          if (sender === "moderator") {
            io.to(room)
              .fetchSockets()
              .then((sockets) => {
                sockets.forEach((s) => {
                  if (s.data?.role === "user") {
                    s.emit("receive_message", message);
                  }
                });
              });
          }

          console.log(`💬 ${sender} sent message in ${room}: "${text}"`);
        } catch (err) {
          console.error("❌ Error in send_message handler:", err);
        }
      }
    );

    /**
     * ❌ DISCONNECT EVENT
     */
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  res.end();
}
