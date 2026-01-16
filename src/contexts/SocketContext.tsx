import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface ConversationUpdate {
  conversationId: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

interface TypingUser {
  conversationId: string;
  userId: string;
  userName: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, message: string, recipientId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  onNewMessage: (callback: (message: ChatMessage) => void) => () => void;
  onConversationUpdated: (callback: (update: ConversationUpdate) => void) => () => void;
  onUserTyping: (callback: (data: TypingUser) => void) => () => void;
  onUserStopTyping: (callback: (data: { conversationId: string; userId: string }) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = 'http://localhost:3001';

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  const joinConversation = useCallback((conversationId: string) => {
    socket?.emit('join-conversation', conversationId);
  }, [socket]);

  const leaveConversation = useCallback((conversationId: string) => {
    socket?.emit('leave-conversation', conversationId);
  }, [socket]);

  const sendMessage = useCallback((conversationId: string, message: string, recipientId: string) => {
    socket?.emit('send-message', { conversationId, message, recipientId });
  }, [socket]);

  const startTyping = useCallback((conversationId: string) => {
    socket?.emit('typing', { conversationId });
  }, [socket]);

  const stopTyping = useCallback((conversationId: string) => {
    socket?.emit('stop-typing', { conversationId });
  }, [socket]);

  const onNewMessage = useCallback((callback: (message: ChatMessage) => void) => {
    if (!socket) return () => {};
    socket.on('new-message', callback);
    return () => {
      socket.off('new-message', callback);
    };
  }, [socket]);

  const onConversationUpdated = useCallback((callback: (update: ConversationUpdate) => void) => {
    if (!socket) return () => {};
    socket.on('conversation-updated', callback);
    return () => {
      socket.off('conversation-updated', callback);
    };
  }, [socket]);

  const onUserTyping = useCallback((callback: (data: TypingUser) => void) => {
    if (!socket) return () => {};
    socket.on('user-typing', callback);
    return () => {
      socket.off('user-typing', callback);
    };
  }, [socket]);

  const onUserStopTyping = useCallback((callback: (data: { conversationId: string; userId: string }) => void) => {
    if (!socket) return () => {};
    socket.on('user-stop-typing', callback);
    return () => {
      socket.off('user-stop-typing', callback);
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinConversation,
        leaveConversation,
        sendMessage,
        startTyping,
        stopTyping,
        onNewMessage,
        onConversationUpdated,
        onUserTyping,
        onUserStopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
