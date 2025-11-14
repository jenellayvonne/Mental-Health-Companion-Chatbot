// src/pages/api/chats/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Fetch all chats with their messages
    const allChats = await prisma.chat.findMany({
      include: {
        messages: {
          orderBy: {
            createdAt: "desc", // Get the most recent message first
          },
          take: 20, // Limit messages to avoid pulling huge histories
        },
      },
    });

    // 2. Filter for chats that have been handed over to a moderator
    const moderatorChats = allChats.filter((chat) =>
      chat.messages.some(
        (msg) => msg.text === "Moderator has joined the conversation."
      )
    );

    // 3. Format the data for the moderator dashboard
    const chatPreviews = moderatorChats.map((chat) => {
        const lastUserMessage = chat.messages.find(
          (msg) => msg.sender === "user" || msg.sender === "moderator"
        );
        return {
          id: chat.roomName,
          // Reliably get username from the roomName, not from a message.
          user: chat.roomName.replace("room_", "") || "Unknown",
          msg: lastUserMessage?.text || "No recent messages",
        };
      }).reverse(); // Show the most recent chats first

    res.status(200).json(chatPreviews);
  } catch (error) {
    console.error("❌ Error fetching chats for moderator:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
