import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Handle GET - Get all chats and latest message
  if (req.method === "GET") {
    try {
      const chats = await prisma.chat.findMany({
        include: {
          // ✅ Include users via the UserChat pivot table
          userChats: {
            include: {
              user: { select: { id: true, username: true } },
            },
          },
          // ✅ Include latest message
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { text: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "desc" }, // ✅ use createdAt (not updatedAt)
      });

      // ✅ Format the data to return
      const formatted = chats.map((chat) => ({
        id: chat.id,
        roomName: chat.roomName,
        users: chat.userChats.map((uc) => uc.user.username),
        lastMessage: chat.messages[0]?.text || "",
        createdAt: chat.createdAt,
      }));

      return res.status(200).json(formatted);
    } catch (error) {
      console.error("Error fetching chats:", error);
      return res.status(500).json({ error: "Failed to load chats" });
    }
  }

  // ✅ Handle POST - Create new chat if needed
  if (req.method === "POST") {
    try {
      const { userId, roomName } = req.body;
      if (!userId) return res.status(400).json({ error: "userId is required" });

      // ✅ Ensure chat exists (by room name)
      let chat = await prisma.chat.findFirst({
        where: { roomName: roomName || `room-${userId}` },
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: { roomName: roomName || `room-${userId}` },
        });
      }

      // ✅ Link user to chat through UserChat table if not linked
      const existingLink = await prisma.userChat.findFirst({
        where: { userId, chatId: chat.id },
      });

      if (!existingLink) {
        await prisma.userChat.create({
          data: { userId, chatId: chat.id },
        });
      }

      return res.status(200).json(chat);
    } catch (error) {
      console.error("Error creating chat:", error);
      return res.status(500).json({ error: "Failed to create chat" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
