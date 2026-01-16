import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TextInput } from '@mantine/core';
import {
  IconMessage,
  IconSend,
  IconSearch,
  IconChevronLeft,
  IconCircleFilled,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader, ListSkeleton } from '@/components/layout';
import { Card, EmptyState } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/services/api';
import type { Conversation, ChatMessage } from '@shared/schemas';

export function ChatPage() {
  const { user } = useAuth();
  const { socket, isConnected, joinConversation, leaveConversation, startTyping, stopTyping } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSyncedKeyRef = useRef<string>('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  // Get params from URL (for starting new conversations or opening existing ones)
  const targetDoctorId = searchParams.get('doctorId');
  const targetConversationId = searchParams.get('conversationId');

  const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/chat/conversations');
      return response.data?.data?.conversations || [];
    },
  });

  // Auto-open conversation by ID if provided
  useEffect(() => {
    if (targetConversationId && !conversationsLoading && conversations?.length) {
      const existingConv = conversations.find((c) => c.id === targetConversationId);
      if (existingConv) {
        setSelectedConversation(existingConv);
      }
      setSearchParams({});
    }
  }, [targetConversationId, conversations, conversationsLoading, setSearchParams]);

  // Auto-start conversation with doctor if doctorId is provided
  useEffect(() => {
    if (targetDoctorId && !conversationsLoading && conversations) {
      // Check if conversation with this doctor already exists
      const existingConv = conversations.find((c) => c.doctorId === targetDoctorId);
      if (existingConv) {
        setSelectedConversation(existingConv);
        setSearchParams({});
      } else {
        // Create new conversation
        api.get(`/chat/conversation-with/${targetDoctorId}`)
          .then((response) => {
            if (response.data?.success) {
              const { conversation } = response.data.data;
              setSelectedConversation(conversation);
              refetchConversations();
              setSearchParams({});
            }
          })
          .catch(console.error);
      }
    }
  }, [targetDoctorId, conversations, conversationsLoading, refetchConversations, setSearchParams]);

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ['chat-messages', selectedConversation?.id],
    queryFn: async () => {
      const response = await api.get(`/chat/conversations/${selectedConversation?.id}/messages`);
      return response.data?.data?.messages || [];
    },
    enabled: !!selectedConversation?.id,
  });

  // Sync local messages with server messages
  useEffect(() => {
    if (!messages) return;

    const syncKey = `${messages.length}:${messages[messages.length - 1]?.id || 'none'}`;
    if (syncKey !== lastSyncedKeyRef.current) {
      lastSyncedKeyRef.current = syncKey;
      setLocalMessages(messages);
    }
  }, [messages]);

  // Real-time message listener
  useEffect(() => {
    if (!socket || !selectedConversation?.id) return;
    
    const handleNewMessage = (newMessage: ChatMessage) => {
      if (newMessage.conversationId === selectedConversation.id) {
        setLocalMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          // Remove temp messages if this is a confirmed message
          const filtered = prev.filter((m) => !m.id.startsWith('temp-'));
          return [...filtered, newMessage];
        });
      }
    };

    socket.on('new-message', handleNewMessage);
    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, selectedConversation?.id]);

  // Conversation update listener
  useEffect(() => {
    if (!socket) return;
    
    const handleConversationUpdated = () => {
      refetchConversations();
    };

    socket.on('conversation-updated', handleConversationUpdated);
    return () => {
      socket.off('conversation-updated', handleConversationUpdated);
    };
  }, [socket, refetchConversations]);

  // Typing indicators
  useEffect(() => {
    if (!socket || !selectedConversation?.id) return;
    
    const handleTyping = (data: { conversationId: string; userId: string; userName: string }) => {
      if (data.conversationId === selectedConversation.id) {
        setTypingUsers((prev) => ({ ...prev, [data.userId]: data.userName }));
      }
    };

    const handleStopTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === selectedConversation.id) {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[data.userId];
          return next;
        });
      }
    };

    socket.on('user-typing', handleTyping);
    socket.on('user-stop-typing', handleStopTyping);
    
    return () => {
      socket.off('user-typing', handleTyping);
      socket.off('user-stop-typing', handleStopTyping);
    };
  }, [socket, selectedConversation?.id]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (selectedConversation?.id) {
      joinConversation(selectedConversation.id);
      return () => {
        leaveConversation(selectedConversation.id);
      };
    }
  }, [selectedConversation?.id, joinConversation, leaveConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      return api.post(`/chat/conversations/${selectedConversation?.id}/messages`, { message: text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessage('');
    },
  });

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setLocalMessages([]);
    setTypingUsers({});
  };

  const filteredConversations = conversations?.filter((conv) => {
    const otherName = user?.role === 'patient' ? conv.doctorName : conv.patientName;
    return otherName?.toLowerCase().includes(search.toLowerCase());
  }) || [];

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleTyping = useCallback(() => {
    if (selectedConversation?.id) {
      startTyping(selectedConversation.id);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        if (selectedConversation?.id) {
          stopTyping(selectedConversation.id);
        }
      }, 2000);
    }
  }, [selectedConversation?.id, startTyping, stopTyping]);

  const handleSend = () => {
    if (message.trim() && selectedConversation) {
      // Add optimistic message
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId: selectedConversation.id,
        senderId: user?.id || '',
        senderName: user?.name || '',
        senderRole: user?.role || 'patient',
        message: message.trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      
      setLocalMessages((prev) => [...prev, tempMessage]);
      sendMutation.mutate(message.trim());
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (selectedConversation?.id) {
        stopTyping(selectedConversation.id);
      }
    }
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    handleTyping();
  };

  // Get typing indicator text
  const typingText = Object.values(typingUsers).length > 0
    ? `${Object.values(typingUsers).join(', ')} is typing...`
    : null;

  // Show/hide conversation list on mobile based on selection
  const showConversationList = !selectedConversation;

  return (
    <DashboardLayout
      title="Messages"
      subtitle={isConnected ? 'Real-time chat enabled' : 'Connecting...'}
      showBreadcrumb={false}
      fullWidth
    >
      <div className="h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] lg:h-[calc(100vh-220px)] flex gap-4 lg:gap-6">
        {/* Conversations List - Hidden on mobile when chat is selected */}
        <Card 
          variant="elevated" 
          padding="none" 
          className={`
            flex-shrink-0 flex flex-col
            w-full lg:w-80
            ${selectedConversation ? 'hidden lg:flex' : 'flex'}
          `}
        >
          <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            <TextInput
              placeholder="Search conversations..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size="sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {conversationsLoading ? (
              <div className="p-4">
                <ListSkeleton count={5} />
              </div>
            ) : filteredConversations?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <IconMessage size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start chatting with a doctor from their profile page</p>
              </div>
            ) : (
              filteredConversations?.map((conv) => {
                const otherName = user?.role === 'patient' ? conv.doctorName : conv.patientName;
                const isSelected = selectedConversation?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`
                      w-full p-3 sm:p-4 text-left transition-colors border-b border-gray-50 dark:border-gray-800 tap-target
                      ${isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">{otherName?.charAt(0)}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">{otherName}</p>
                          {conv.lastMessageAt && (
                            <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">{formatTime(conv.lastMessageAt)}</span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                        )}
                      </div>
                      {(conv.unreadCount ?? 0) > 0 && (
                        <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Chat Window - Full width on mobile when selected */}
        <Card 
          variant="elevated" 
          padding="none" 
          className={`
            flex-1 flex flex-col
            ${selectedConversation ? 'flex' : 'hidden lg:flex'}
          `}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                {/* Back button on mobile */}
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <IconChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                
                <div className="relative">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {(user?.role === 'patient' ? selectedConversation.doctorName : selectedConversation.patientName)?.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                    {user?.role === 'patient' ? selectedConversation.doctorName : selectedConversation.patientName}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {typingText || (user?.role === 'patient' ? 'Doctor' : 'Patient')}
                  </p>
                </div>
                {isConnected && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <IconCircleFilled size={8} />
                    <span className="hidden sm:inline">Live</span>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-hide">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">Loading messages...</p>
                  </div>
                ) : localMessages?.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center px-4">
                      <IconMessage size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No messages yet</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  localMessages?.map((msg) => {
                    const isOwn = msg.senderId === user?.id;
                    const isTemp = msg.id.startsWith('temp-');
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                          max-w-[85%] sm:max-w-[70%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl
                          ${isOwn 
                            ? 'bg-blue-500 text-white rounded-br-sm' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                          }
                          ${isTemp ? 'opacity-70' : ''}
                        `}>
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-[10px] sm:text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                            {isTemp ? 'Sending...' : formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                {typingText && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-2xl rounded-bl-sm text-sm">
                      <span className="flex items-center gap-1">
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 sm:gap-3">
                  <TextInput
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => handleMessageChange(e.currentTarget.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="flex-1"
                    size="sm"
                    classNames={{
                      input: 'h-10 sm:h-11'
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || sendMutation.isPending}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0 tap-target"
                  >
                    <IconSend size={18} className="text-white sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<IconMessage size={48} className="text-gray-300 dark:text-gray-600" />}
                title="Select a conversation"
                description="Choose a conversation from the list or start a new chat from a doctor's profile"
              />
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
