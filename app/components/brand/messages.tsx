'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { subscribeToUserConversations, subscribeToConversationMessages, sendMessage, markMessagesAsRead, Conversation, Message } from '@/app/lib/firebase/messages';
import { getUserDocument } from '@/app/lib/firebase/utils';
import MessagingPanel from '@/app/components/messages/messaging-panel';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, Send, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import React from 'react';

// Mobile Chat Header Component
function MobileChatHeader({ 
  otherUser, 
  onBack 
}: { 
  otherUser: any; 
  onBack: () => void; 
}) {
  return (
    <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      
      {/* Profile Info */}
      <div className="flex items-center space-x-3 flex-1">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          {otherUser?.profilePic && (
            <Image 
              src={otherUser.profilePic} 
              alt={otherUser.name || 'User'} 
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {otherUser?.name || 'Unknown User'}
          </h3>
          {otherUser?.instagram && (
            <p className="text-sm text-gray-500 truncate">@{otherUser.instagram}</p>
          )}
          <p className="text-xs text-green-600">Active</p>
        </div>
      </div>
      
      {/* More Options */}
      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}

// Mobile Chat View Component
function MobileChatView({ 
  conversation, 
  onBack 
}: { 
  conversation: Conversation; 
  onBack: () => void; 
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUserInfo, setOtherUserInfo] = useState<any>(null);

  // Get other participant info
  useEffect(() => {
    if (!conversation || !user) return;
    
    const otherParticipantId = conversation.participants.find(id => id !== user.uid);
    if (!otherParticipantId) return;

    const fetchOtherUser = async () => {
      try {
        const userData = await getUserDocument(otherParticipantId);
        if (userData) {
          setOtherUserInfo({
            name: userData.role === 'brand' ? userData.brandName : `${userData.firstName} ${userData.lastName}`,
            profilePic: userData.profileImageUrl,
            role: userData.role,
            instagram: userData.instagramHandle
          });
        }
      } catch (error) {
        console.error('Error fetching other user:', error);
      }
    };

    fetchOtherUser();
  }, [conversation, user]);

  // Subscribe to messages
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = subscribeToConversationMessages(
      conversation.id,
      (msgs) => {
        setMessages(msgs);
        // Mark messages as read
        if (user?.uid) {
          markMessagesAsRead(conversation.id, user.uid);
        }
      }
    );

    return unsubscribe;
  }, [conversation?.id, user?.uid]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending || !user?.uid || !conversation?.id) return;

    setSending(true);
    try {
      await sendMessage(conversation.id, user.uid, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sm:hidden h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <MobileChatHeader otherUser={otherUserInfo} onBack={onBack} />
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.senderId === user?.uid
                  ? 'bg-red-burgundy text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.senderId === user?.uid ? 'text-red-100' : 'text-gray-500'
              }`}>
                {format(new Date(message.timestamp.seconds * 1000), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-red-burgundy"
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sending}
            className="p-3 bg-red-burgundy text-white rounded-full hover:bg-red-wine transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Mobile Conversation List Component  
function MobileConversationList({ 
  conversations, 
  onSelectConversation 
}: { 
  conversations: Conversation[]; 
  onSelectConversation: (conversation: Conversation) => void; 
}) {
  const { user } = useAuth();

  if (conversations.length === 0) {
    return (
      <div className="sm:hidden h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500 text-sm">Start connecting with creators to begin conversations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:hidden h-full bg-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-200">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Messages</h2>
        <p className="text-gray-500 mt-1">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
      </div>
      
      {/* Conversation List */}
      <div className="overflow-y-auto">
        {conversations.map((conversation) => {
          const otherParticipant = conversation.participants.find(id => id !== user?.uid);
          const otherUserInfo = otherParticipant ? conversation.participantInfo[otherParticipant] : null;
          
          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                {/* Profile Picture */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {otherUserInfo?.profilePic && (
                    <Image 
                      src={otherUserInfo.profilePic} 
                      alt={otherUserInfo.name || 'User'} 
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                
                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {otherUserInfo?.name || 'Unknown User'}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {format(new Date(conversation.lastMessage.timestamp.seconds * 1000), 'MMM d')}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage.text}
                    </p>
                  )}
                </div>
                
                {/* Unread indicator */}
                {conversation.hasUnread && (
                  <div className="w-2 h-2 bg-red-burgundy rounded-full flex-shrink-0"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(function BrandMessages() {
  const { user } = useAuth();
  const t = useTranslations('brand.messaging.loading');
  const searchParams = useSearchParams();
  const chatId = searchParams?.get('chatId') || undefined;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    
    console.log('🔔 Fetching messages for brand:', user.uid);
    const unsubscribe = subscribeToUserConversations(user.uid, (convs) => {
      console.log('📨 BrandMessages received conversations:', convs);
      setConversations(convs);
      setLoading(false);
      
      // Auto-select conversation if chatId provided
      if (chatId && convs.length > 0) {
        const conv = convs.find(c => c.id === chatId);
        if (conv) {
          setSelectedConversation(conv);
        }
      }
    });
    
    return () => unsubscribe();
  }, [user, chatId]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#FDFCF9'}}>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-red-burgundy/10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-burgundy mx-auto"></div>
          <p className="text-red-burgundy font-serif mt-4 text-center">{t('conversations')}</p>
        </div>
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="h-screen flex flex-col" style={{backgroundColor: '#FDFCF9'}}>
      {/* Mobile Navigation Stack */}
      <div className="sm:hidden flex-1">
        {selectedConversation ? (
          <MobileChatView 
            conversation={selectedConversation} 
            onBack={handleBackToList}
          />
        ) : (
          <MobileConversationList 
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
          />
        )}
      </div>

      {/* Desktop View - unchanged */}
      <div className="hidden sm:flex flex-1 overflow-hidden">
        <MessagingPanel 
          userRole="brand" 
          selectedConversationId={chatId}
        />
      </div>
    </div>
  );
});