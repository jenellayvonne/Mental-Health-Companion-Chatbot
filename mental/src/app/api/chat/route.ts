
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function getFirstUser() {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error("No users found in the database.");
  }
  return user;
}

export async function POST(req: Request) {
  try {
    let { message, conversationId } = await req.json();

    if (!conversationId) {
      const user = await getFirstUser();
      const conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
        },
      });
      conversationId = conversation.id;
    }

    // 1. Save the user's message
    const userMessage = await prisma.message.create({
      data: {
        text: message,
        sender: 'user',
        conversation: {
          connect: { id: conversationId },
        },
      },
    });

    // 2. Retrieve the conversation history
    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    // 3. Format the history for the Generative AI model
    const chatHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // 4. Generate the AI response
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ],
    });

    const result = await model.generateContent({ contents: chatHistory });
    const aiResponse = result.response.text();

    // 5. Save the AI's response
    const aiMessage = await prisma.message.create({
      data: {
        text: aiResponse,
        sender: 'AI',
        conversation: {
          connect: { id: conversationId },
        },
      },
    });

    return NextResponse.json({ userMessage, aiMessage, conversationId });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
