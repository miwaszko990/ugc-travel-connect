'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { subscribeToUserConversations, Conversation } from '@/app/lib/firebase/messages';
import MessagingPanel from '@/app/components/messages/messaging-panel';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, MoreVertical } from 'lucide-react';
import React from 'react';

// Mobile-only conversation list component
function MobileConversationList({ 
  conversations, 
  onSelectConversation,
  loading 
}: { 
  conversations: Conversation[]; 
  onSelectConversation: (conversation: Conversation) => void;
  loading: boolean;
}) {
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="sm:hidden h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-burgundy"></div>
      </div>
    );
  }

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
          <p className="text-gray-500 text-sm">Start networking with creators to begin conversations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:hidden h-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Messages</h2>
        <p className="text-gray-500 mt-1">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
      </div>
      
      {/* Conversation List with bottom padding for navigation */}
      <div className="flex-1 overflow-y-auto pb-20">
        {conversations.map((conversation) => {
          const otherParticipant = conversation.participants.find(id => id !== user?.uid);
          const otherUserInfo = otherParticipant ? conversation.participantInfo[otherParticipant] : null;
          
          // Format timestamp properly
          const formatTimestamp = (timestamp: number | { seconds: number }) => {
            const date = typeof timestamp === 'number' 
              ? new Date(timestamp) 
              : new Date(timestamp.seconds * 1000);
            return date.toLocaleDateString();
          };
          
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
                    <img 
                      src={otherUserInfo.profilePic} 
                      alt={otherUserInfo.name || 'User'} 
                      className="w-full h-full object-cover"
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
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTimestamp(conversation.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-500 truncate pr-4">
                      {conversation.lastMessage.text}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Mobile-only chat header component
function MobileChatHeader({ 
  conversation, 
  onBack 
}: { 
  conversation: Conversation; 
  onBack: () => void; 
}) {
  const { user } = useAuth();
  const otherParticipant = conversation.participants.find(id => id !== user?.uid);
  const otherUserInfo = otherParticipant ? conversation.participantInfo[otherParticipant] : null;

  return (
    <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3 flex-shrink-0">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      
      {/* Profile Info */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {otherUserInfo?.profilePic && (
            <img 
              src={otherUserInfo.profilePic} 
              alt={otherUserInfo.name || 'User'} 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {otherUserInfo?.name || 'Unknown User'}
          </h3>
          <p className="text-sm text-gray-500 truncate">@{otherUserInfo?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}</p>
          <p className="text-xs text-green-600">Active</p>
        </div>
      </div>
      
      {/* More Options */}
      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}

// Mobile-only chat view component
function MobileChatView({ 
  conversation, 
  onBack 
}: { 
  conversation: Conversation; 
  onBack: () => void; 
}) {
  return (
    <div className="sm:hidden h-full flex flex-col">
      {/* Mobile Header */}
      <MobileChatHeader conversation={conversation} onBack={onBack} />
      
      {/* Desktop messaging panel in mobile view with custom styling */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full pb-20"> {/* Add bottom padding for navigation */}
          <MessagingPanel 
            userRole="brand" 
            selectedConversationId={conversation.id}
          />
        </div>
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
            loading={loading}
          />
        )}
      </div>

      {/* Desktop View - completely unchanged */}
      <div className="hidden sm:flex flex-1 overflow-hidden">
        <MessagingPanel 
          userRole="brand" 
          selectedConversationId={chatId}
        />
      </div>
    </div>
  );
});