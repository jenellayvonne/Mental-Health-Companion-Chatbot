import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ObjectId } from "bson";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { roomName, sender, text, username } = req.body;

    if (!roomName || !sender || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Ensure the Chat exists (create if not)
    let chat = await prisma.chat.findUnique({
      where: { roomName },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: { roomName },
      });
    }

    // ✅ Create message record
    const newMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        sender,
        text,
        username: username || "unknown",
      },
    });

    // ✅ Link to UserChat if user exists
    if (username) {
      const user = await prisma.user.findUnique({ where: { username } });
      if (user) {
        const existingLink = await prisma.userChat.findFirst({
          where: { userId: user.id, chatId: chat.id },
        });
        if (!existingLink) {
          await prisma.userChat.create({
            data: { userId: user.id, chatId: chat.id },
          });
        }
      }
    }

    return res.status(200).json(newMessage);
  } catch (err) {
    console.error("❌ Error saving message:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
