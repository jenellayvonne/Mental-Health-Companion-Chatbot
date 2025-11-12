import { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import { Server as NetServer } from "http";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ CREATE message
  if (req.method === "POST") {
    try {
      const { chatId, sender, text, username } = req.body;

      if (!chatId || !sender || !text) {
        return res.status(400).json({ error: "Missing required fields (chatId, sender, text)" });
      }

      // ✅ Save message in MongoDB
      const message = await prisma.message.create({
        data: {
          chatId,
          sender,
          text,
          username: username || "Unknown",
        },
      });

      // ✅ Emit socket event if socket server exists
      const server = (res.socket as any).server as NetServer & { io?: IOServer };
      if (server?.io) {
        if (message.sender === "user" || message.sender === "moderator") {
        server.io.to(chatId).emit("receive_message", {
          sender: message.sender,
          text: message.text,
          username: message.username,
          chatId: message.chatId,
          createdAt: message.createdAt,
        });
      }
    }

      return res.status(200).json({ success: true, message });
    } catch (err) {
      console.error("❌ Error creating message:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  // ✅ FETCH messages by chatId
  if (req.method === "GET") {
    try {
      const { chatId } = req.query;
      if (!chatId || typeof chatId !== "string") {
        return res.status(400).json({ error: "chatId is required." });
      }

      const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
      });

      return res.status(200).json(messages);
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  return res.status(405).json({ error: "Method not allowed." });
}
