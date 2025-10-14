import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { prompt, userId, conversationId } = await req.json();

    if (!prompt) {
      return new NextResponse('Missing prompt', { status: 400 });
    }

    if (!userId) {
      return new NextResponse('Missing userId', { status: 400 });
    }

    let conversation;

    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
    } else {
      conversation = await prisma.conversation.create({
        data: { userId },
      });
    }

    if (!conversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'user',
        text: prompt,
      },
    });

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Save AI response
    const aiMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'AI',
        text,
      },
    });

    return NextResponse.json({ response: aiMessage.text, conversationId: conversation.id });
  } catch (error) {
    console.error('[CHAT_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}