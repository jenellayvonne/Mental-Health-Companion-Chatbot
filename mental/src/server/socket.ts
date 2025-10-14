
import { Server } from 'socket.io';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

// Ensure you have your GEMINI_API_KEY in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
    },
  });

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinConversation', async (conversationId) => {
      socket.join(conversationId);
      console.log(`user joined conversation: ${conversationId}`);

      // Fetch previous messages
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
      });
      socket.emit('previousMessages', messages);
    });

    socket.on('sendMessage', async (data) => {
      const { conversationId, sender, text } = data;

      // Save user message
      const userMessage = await prisma.message.create({
        data: {
          conversationId,
          sender,
          text,
        },
      });
      io.to(conversationId).emit('receiveMessage', userMessage);

      // AI response
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash'});
        const result = await model.generateContent(text);
        const response = await result.response;
        const aiText = response.text();

        const aiMessage = await prisma.message.create({
          data: {
            conversationId,
            sender: 'ai',
            text: aiText,
          },
        });
        io.to(conversationId).emit('receiveMessage', aiMessage);
      } catch (error) {
        console.error('Error generating AI response:', error);
        socket.emit('error', 'Error generating AI response');
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};
