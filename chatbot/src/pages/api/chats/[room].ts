// src/pages/api/chats/[room].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { room, role } = req.query;

  if (!room || typeof room !== "string") {
    return res.status(400).json({ error: "room is required" });
  }

  try {
    // ✅ Fetch chat + messages (sorted)
    const chat = await prisma.chat.findUnique({
      where: { roomName: room },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const allMessages = chat.messages;

    // ✅ If moderator mode → only show messages from moderator join onwards
    if (role === "moderator") {
      const joinIndex = allMessages.findIndex(
        (msg) => msg.text === "Moderator has joined the conversation."
      );

      // If moderator join message found
      if (joinIndex !== -1) {
        // Always include that join message as the first one
        const filtered = allMessages.slice(joinIndex)
        .filter((msg) => msg.sender !== "ai");
        return res.status(200).json(filtered);
      }

      // If not found, fallback (maybe moderator hasn't joined yet)
      return res.status(200).json([]);
    }

    // ✅ Default (user / AI side): return all messages
    return res.status(200).json(allMessages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
