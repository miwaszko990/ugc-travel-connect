'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Conversation, subscribeToUserConversations } from '@/app/lib/firebase/messages';
import { useAuth } from '@/app/hooks/useAuth';
import { Spinner } from '@/app/components/ui/spinner';
import { db } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface ConversationListProps {
  onSelectConversation: (conversationId: string, otherUser: { id: string; name: string; role: string; profilePic?: string; instagram?: string }) => void;
  selectedConversationId?: string;
  userRole: 'brand' | 'creator';
}

export default function ConversationList({ 
  onSelectConversation, 
  selectedConversationId,
  userRole 
}: ConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfoCache, setUserInfoCache] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubscribe = subscribeToUserConversations(user.uid, (conversationList) => {
      setConversations(conversationList);
      setLoading(false);
      
      // Auto-select first conversation if none selected and available
      if (!selectedConversationId && conversationList.length > 0) {
        const firstConversation = conversationList[0];
        const otherParticipantId = firstConversation.participants.find(id => id !== user.uid) || '';
        const otherParticipantInfo = firstConversation.participantInfo?.[otherParticipantId] || {
          name: 'Unknown',
          role: userRole === 'brand' ? 'creator' : 'brand',
          profilePic: undefined,
          instagram: undefined,
        };
        
        onSelectConversation(
          firstConversation.id, 
          { 
            id: otherParticipantId, 
            name: otherParticipantInfo.name, 
            role: otherParticipantInfo.role,
            profilePic: otherParticipantInfo.profilePic,
            instagram: otherParticipantInfo.instagram,
          }
        );
      }
    });

    return () => unsubscribe();
  }, [user, onSelectConversation, selectedConversationId, userRole]);

  // Fetch user info for missing participants
  useEffect(() => {
    const missing = conversations
      .map((c) => {
        const otherId = c.participants.find(id => id !== user?.uid);
        const info = c.participantInfo?.[otherId];
        if (!otherId || (info && info.name && info.name !== 'Unknown User')) return null;
        return otherId;
      })
      .filter(Boolean) as string[];

    missing.forEach(async (uid) => {
      if (userInfoCache[uid]) return;
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          const data = snap.data();
          const userInfo = {
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
            profilePic: data.profileImageUrl || '',
            instagram: data.instagramHandle || '',
            role: data.role || 'creator',
          };
          setUserInfoCache((prev) => ({ ...prev, [uid]: userInfo }));
          
          // Update the conversation's participant info
          setConversations(prev => prev.map(conv => {
            if (conv.participants.includes(uid)) {
              return {
                ...conv,
                participantInfo: {
                  ...conv.participantInfo,
                  [uid]: userInfo
                }
              };
            }
            return conv;
          }));
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    });
  }, [conversations, user, userInfoCache]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner size="md" />
      </div>
    );
  }

  if (conversations.length === 0) {
    const targetRole = userRole === 'brand' ? 'creators' : 'brands';
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm mt-2">Connect with {targetRole} to start messaging</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        // Find the other participant (not the current user)
        const otherParticipantId = conversation.participants.find(id => id !== user?.uid) || '';
        const otherParticipantInfo = conversation.participantInfo?.[otherParticipantId] || userInfoCache[otherParticipantId] || {
          name: 'Unknown User',
          role: userRole === 'brand' ? 'creator' : 'brand',
          profilePic: undefined,
          instagram: undefined,
        };
        
        // Check if there are unread messages in this conversation
        const hasUnreadMessages = false; // We'll implement this later
        
        const isSelected = conversation.id === selectedConversationId;
        
        return (
          <li 
            key={conversation.id}
            className={`
              p-4 hover:bg-gray-50 cursor-pointer transition-colors
              ${isSelected ? 'bg-gray-100' : ''}
              ${hasUnreadMessages ? 'font-medium' : ''}
            `}
            onClick={() => onSelectConversation(
              conversation.id, 
              { 
                id: otherParticipantId, 
                name: otherParticipantInfo.name, 
                role: otherParticipantInfo.role,
                profilePic: otherParticipantInfo.profilePic,
                instagram: otherParticipantInfo.instagram,
              }
            )}
          >
            <div className="flex items-start">
              <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                {otherParticipantInfo.profilePic ? (
                  <Image
                    src={otherParticipantInfo.profilePic}
                    alt={otherParticipantInfo.name}
                    fill
                    className="rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                    {otherParticipantInfo.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                )}
                {hasUnreadMessages && (
                  <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-primary border-2 border-white" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="font-medium truncate">{otherParticipantInfo.name}</span>
                  {conversation.lastMessage?.timestamp && (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true })}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 truncate">
                  {conversation.lastMessage?.text || 'No messages yet'}
                </p>
                {otherParticipantInfo.instagram && (
                  <div className="text-xs text-blue-500 mt-1">@{otherParticipantInfo.instagram}</div>
                )}
                <div className="mt-1 text-xs text-gray-400">
                  {otherParticipantInfo.role === 'brand' ? 'Brand' : 'Creator'}
                </div>
                {/* TODO: If name/profilePic is 'Unknown', fetch user info from Firestore here and update UI */}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
} // review trigger
