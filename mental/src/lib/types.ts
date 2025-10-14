import { User as PrismaUser, Conversation as PrismaConversation, Message } from '@prisma/client';

export type User = PrismaUser & {
  conversations: Conversation[];
};

export type Conversation = PrismaConversation & {
  user: PrismaUser;
  messages: Message[];
};
