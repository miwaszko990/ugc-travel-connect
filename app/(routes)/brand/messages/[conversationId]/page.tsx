'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Transition } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  subscribeToConversationMessages, 
  Message, 
  sendMessage, 
  markConversationAsRead, 
  getConversationId,
  updateTypingStatus,
  subscribeToTypingStatus
} from '@/app/lib/firebase/messages';

// Chat Bubble Component
const ChatBubble = ({ message, isCurrentUser }: { message: Message, isCurrentUser: boolean }) => {
  const messageTime = format(new Date(message.timestamp), 'h:mm a');
  
  return (
    <div className={`chat ${isCurrentUser ? 'chat-end' : 'chat-start'}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <Image 
            src={message.senderProfilePic || '/placeholder-profile.jpg'} 
            alt={message.senderName || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      </div>
      <div className="chat-header">
        {message.senderName || 'Anonymous'}
        <time className="text-xs opacity-50 ml-1">{messageTime}</time>
      </div>
      <div className={`chat-bubble ${isCurrentUser ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
        {message.text}
      </div>
      {isCurrentUser && message.read && (
        <div className="chat-footer opacity-50 text-xs">Seen</div>
      )}
    </div>
  );
};

// Typing Indicator Component
const TypingIndicator = ({ isTyping, name }: { isTyping: boolean, name: string }) => {
  return (
    <Transition
      show={isTyping}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="chat chat-start">
        <div className="chat-bubble chat-bubble-secondary bg-opacity-50">
          <div className="flex items-center">
            <span className="text-sm mr-2">{name} is typing</span>
            <span className="flex space-x-1">
              <span className="animate-bounce delay-0 h-2 w-2 bg-current rounded-full inline-block"></span>
              <span className="animate-bounce delay-150 h-2 w-2 bg-current rounded-full inline-block"></span>
              <span className="animate-bounce delay-300 h-2 w-2 bg-current rounded-full inline-block"></span>
            </span>
          </div>
        </div>
      </div>
    </Transition>
  );
};

// Chat Input Component
const ChatInput = ({ 
  onSendMessage, 
  onTyping, 
  isLoading 
}: { 
  onSendMessage: (text: string) => Promise<void>, 
  onTyping: () => void,
  isLoading: boolean 
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  // Debounce typing indicator
  useEffect(() => {
    if (text.length > 0) {
      const timer = setTimeout(() => {
        onTyping();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [text, onTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    try {
      await onSendMessage(text);
      setText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-gray-50 p-4 border-t sticky bottom-0">
      <div className="flex items-end gap-2">
        <div className="flex-grow">
          <textarea
            ref={textareaRef}
            className="textarea textarea-bordered w-full resize-none"
            rows={1}
            placeholder="Type your message here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isLoading || !text.trim()}
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </form>
  );
};

export default function ConversationPage() {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserInfo, setOtherUserInfo] = useState<{
    id: string;
    name: string;
    profilePic?: string;
    isTyping: boolean;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Subscribe to messages
  useEffect(() => {
    if (!user?.uid || !conversationId) return;
    
    console.log('Loading conversation:', conversationId);
    
    // Mark conversation as read when opened
    markConversationAsRead(conversationId as string, user.uid);
    
    // Subscribe to messages
    const unsubscribe = subscribeToConversationMessages(
      conversationId as string, 
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
        
        // Find the other user ID
        if (newMessages.length > 0) {
          const otherUserId = newMessages[0].senderId === user.uid 
            ? newMessages[0].receiverId 
            : newMessages[0].senderId;
          
          // Get other user info
          const otherUserMessage = newMessages.find(m => m.senderId === otherUserId);
          if (otherUserMessage && !otherUserInfo) {
            setOtherUserInfo({
              id: otherUserId,
              name: otherUserMessage.senderName || 'User',
              profilePic: otherUserMessage.senderProfilePic,
              isTyping: false
            });
          }
        }
        
        // Mark messages as read again after new messages arrive
        markConversationAsRead(conversationId as string, user.uid);
      }
    );
    
    return () => unsubscribe();
  }, [user, conversationId, otherUserInfo]);

  // Subscribe to typing status
  useEffect(() => {
    if (!user?.uid || !conversationId || !otherUserInfo) return;
    
    const unsubscribe = subscribeToTypingStatus(
      conversationId as string,
      otherUserInfo.id,
      (isTyping) => {
        setOtherUserInfo(prev => prev ? { ...prev, isTyping } : null);
      }
    );
    
    return () => unsubscribe();
  }, [user, conversationId, otherUserInfo]);

  // Handle sending message
  const handleSendMessage = async (text: string) => {
    if (!user || !conversationId || !text.trim()) return;
    
    setSending(true);
    try {
      // If otherUserInfo is null, try to extract receiverId from conversationId
      const receiverId = otherUserInfo?.id || conversationId.toString().split('_').find(id => id !== user.uid) || '';
      
      await sendMessage(
        user.uid, 
        receiverId,
        text,
        user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'User',
        user.profileImageUrl
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!user?.uid || !conversationId) return;
    
    updateTypingStatus(conversationId as string, user.uid, true);
    
    // Reset typing status after 2 seconds
    setTimeout(() => {
      updateTypingStatus(conversationId as string, user.uid, false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4 flex items-center">
        <Link href="/dashboard/brand" className="btn btn-ghost btn-sm mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Back
        </Link>
        
        {otherUserInfo && (
          <div className="flex items-center">
            <div className="avatar mr-3">
              <div className="w-10 rounded-full">
                <Image 
                  src={otherUserInfo.profilePic || '/placeholder-profile.jpg'} 
                  alt={otherUserInfo.name}
                  width={40}
                  height={40}
                />
              </div>
            </div>
            <div>
              <h3 className="font-medium">{otherUserInfo.name}</h3>
            </div>
          </div>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble 
              key={message.timestamp} 
              message={message} 
              isCurrentUser={message.senderId === user?.uid}
            />
          ))
        )}
        
        {/* Typing indicator */}
        {otherUserInfo && (
          <TypingIndicator 
            isTyping={otherUserInfo.isTyping} 
            name={otherUserInfo.name} 
          />
        )}
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        onTyping={handleTyping}
        isLoading={sending} 
      />
    </div>
  );
}