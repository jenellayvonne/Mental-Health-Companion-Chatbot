import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        user: true,
        messages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('[CONVERSATIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
