export interface SocketUser {
  userId: string;
  role: string;
  doctorId?: string;
  name?: string;
}

export interface SendMessageData {
  conversationId: string;
  message: string;
  recipientId: string;
}

export interface NewMessageData {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface TypingData {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}
