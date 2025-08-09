'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Message, subscribeToConversationMessages, sendMessage, markConversationAsRead } from '@/app/lib/firebase/messages';
import { useAuth } from '@/app/hooks/auth';
import { Spinner } from '@/app/components/ui/spinner';

interface ChatViewProps {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    role: string;
    profilePic?: string;
    instagram?: string;
  };
  userRole: 'brand' | 'creator';
}

export default function ChatView({ conversationId, otherUser, userRole }: ChatViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Subscribe to messages
  useEffect(() => {
    if (!conversationId || !user) return;

    setLoading(true);
    const unsubscribe = subscribeToConversationMessages(conversationId, (messageList) => {
      setMessages(messageList);
      setLoading(false);
      
      // Mark conversation as read
      markConversationAsRead(conversationId, user.uid).catch(err => {
        console.error('Error marking conversation as read:', err);
      });
    });

    return () => unsubscribe();
  }, [conversationId, user]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 150)}px`;
    }
  }, [newMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      
      // Get current user's display info
      const userDisplayName = userRole === 'brand' 
        ? user.brandName || user.displayName || 'Brand' 
        : user.firstName || user.displayName || 'Creator';
      
      const profilePic = user.profileImageUrl || user.logoUrl || undefined;
      
      await sendMessage(
        user.uid,
        otherUser.id,
        newMessage,
        userDisplayName,
        profilePic
      );
      
      setNewMessage('');
      
      // Reset textarea height
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm px-6 py-4 border-b flex items-center gap-4">
        <div className="relative w-12 h-12">
          <Image
            src={otherUser.profilePic || '/placeholder-profile.jpg'}
            alt={otherUser.name}
            fill
            className="rounded-full object-cover border border-gray-200"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-gray-900">{otherUser.name}</span>
          {otherUser.instagram && (
            <a
              href={`https://instagram.com/${otherUser.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              @{otherUser.instagram}
            </a>
          )}
          <span className="text-xs text-gray-400">{otherUser.role === 'brand' ? 'Brand' : 'Creator'}</span>
        </div>
      </div>
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#fafbfc]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-center text-base">
              No messages yet. Send a message to start the conversation.
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = message.senderId === user?.uid;
            const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1]?.senderId !== message.senderId);
            return (
              <div
                key={`${message.timestamp}-${index}`}
                className={`flex items-end mb-6 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar for other user */}
                {!isCurrentUser && showAvatar && (
                  <div className="relative w-8 h-8 mr-3 flex-shrink-0">
                    <Image
                      src={message.senderProfilePic || '/placeholder-profile.jpg'}
                      alt={message.senderName || 'User'}
                      fill
                      className="rounded-full object-cover border border-gray-200"
                    />
                  </div>
                )}
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  {/* Sender name for other user */}
                  {!isCurrentUser && showAvatar && (
                    <span className="text-xs text-gray-500 mb-1 ml-1">{message.senderName || 'User'}</span>
                  )}
                  <div
                    className={`px-5 py-3 rounded-xl shadow-md max-w-[70vw] md:max-w-[420px] break-words whitespace-pre-wrap text-base font-medium ${
                      isCurrentUser
                        ? 'bg-[#7c3aed] text-white rounded-br-md'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    {message.text}
                  </div>
                  <span className={`text-xs mt-1 ${isCurrentUser ? 'text-purple-200' : 'text-gray-400'} font-normal`}>
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    {isCurrentUser && (
                      <span className="ml-2">{message.read ? '✓✓' : '✓'}</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Message input */}
      <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex items-center gap-3 z-10">
        <form onSubmit={handleSendMessage} className="flex items-center w-full gap-3">
          <textarea
            ref={textAreaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 resize-none border border-gray-200 rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-[#fafbfc] text-base shadow-sm"
            rows={1}
            disabled={sending}
            style={{ minHeight: 44, maxHeight: 120 }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            aria-label="Send message"
          >
            {sending ? (
              <Spinner size="sm" color="white" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} // review trigger
