import { z } from 'zod';

export const ConversationSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  doctorId: z.string(),
  doctorName: z.string(),
  lastMessage: z.string().nullable(),
  lastMessageAt: z.string().nullable(),
  unreadCount: z.number(),
  createdAt: z.string(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderRole: z.enum(['patient', 'doctor']),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const SendMessageSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().min(1, 'Recipient is required'),
  message: z.string().min(1, 'Message is required').max(2000),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;

export const StartConversationSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  message: z.string().min(1, 'Message is required').max(2000),
});

export type StartConversationInput = z.infer<typeof StartConversationSchema>;
