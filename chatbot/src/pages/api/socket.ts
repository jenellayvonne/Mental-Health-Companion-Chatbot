import type { NextApiRequest, NextApiResponse } from "next";
import { Server, Socket } from "socket.io";
import { PrismaClient, Message } from "@prisma/client";

const prisma = new PrismaClient();
export const config = { api: { bodyParser: false } };

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

  io.on("connection", (socket: Socket) => {
    console.log("✅ New client connected:", socket.id);

    socket.on("register_moderator", () => {
      socket.join("moderators");
      socket.data.isModerator = true;
      console.log(`🛡️ Moderator registered: ${socket.id}`);
    });

    socket.on(
      "join_room",
      async ({ roomId, username }: { roomId: string; username?: string }) => {
        if (!roomId) {
          console.error(`❌ Error: roomId is missing for socket ${socket.id} in join_room event.`);
          return;
        }
        socket.join(roomId);
        socket.data.username = username;
        if (socket.data.isModerator) {
          socket.data.currentRoom = roomId;
        }
        console.log(`[${roomId}] ${username} (${socket.id}) joined.`);

        try {
          const chat = await prisma.chat.findUnique({
            where: { roomName: roomId },
            include: {
              messages: { orderBy: { createdAt: "asc" } },
            },
          });

          if (!chat || !chat.messages) {
            socket.emit("load_messages", []);
            return;
          }

          let messagesToSend: Message[] = chat.messages;
          if (socket.data.isModerator) {
            const allMessages = chat.messages;
            
            // Find the start of the latest moderator session
            const lastHandoverMsgIndex = allMessages.findLastIndex(
              (msg) => msg.text === "Moderator has joined the conversation."
            );

            if (lastHandoverMsgIndex === -1) {
              messagesToSend = []; // No handover found, so no messages to send
            } else {
              // Find the end of that same session
              const sessionEndMsgIndex = allMessages.findIndex(
                (msg) => 
                  msg.text === "Moderator session ended." &&
                  new Date(msg.createdAt) > new Date(allMessages[lastHandoverMsgIndex].createdAt)
              );
              
              const startIndex = lastHandoverMsgIndex + 1;
              const endIndex = sessionEndMsgIndex !== -1 ? sessionEndMsgIndex : allMessages.length;
              
              messagesToSend = allMessages.slice(startIndex, endIndex);
            }
          }
          socket.emit("load_messages", messagesToSend);
        } catch (err) {
          console.error(`❌ Error loading messages for room ${roomId}:`, err);
        }
      }
    );

    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      if (socket.data.isModerator) {
        delete socket.data.currentRoom;
      }
      console.log(`[${roomId}] user ${socket.id} left.`);
    });

    socket.on(
      "send_message",
      async (data: { room: string; sender: string; text: string; username?: string }) => {
        const { room, sender, text, username } = data;
        if (!room || !text) return;

        try {
          const message = await prisma.message.create({
            data: {
              chat: { connect: { roomName: room } },
              sender,
              text,
              username: username || "Unknown",
            },
          });

          const messageToSend = { ...message, room };

          // Broadcast to everyone in the room (user and any joined mod)
          io.to(room).emit("receive_message", messageToSend);

          // If the user sends a message, also notify all moderators for the dashboard
          if (sender === "user") {
            io.to("moderators").emit("new_chat_message", {
              room,
              username: message.username,
              msg: message.text,
            });
          }

          console.log(`[${room}] ${sender} (${username}): \"${text}\"`);
        } catch (err) {
          console.error("❌ Error in send_message handler:", err);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected:", socket.id);
    });
  });

  res.end();
}
