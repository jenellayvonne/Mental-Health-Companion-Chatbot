
import { Server } from 'socket.io';
import http from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for now, you might want to restrict this in production
    },
  });

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`user joined conversation: ${conversationId}`);
    });

    socket.on('sendMessage', async (data) => {
      const { conversationId, sender, text } = data;
      const message = await prisma.message.create({
        data: {
          conversationId,
          sender,
          text,
        },
      });
      io.to(conversationId).emit('receiveMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};
