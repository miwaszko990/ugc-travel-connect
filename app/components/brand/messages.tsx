'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { subscribeToUserConversations, Conversation } from '@/app/lib/firebase/messages';
import MessagingPanel from '@/app/components/messages/messaging-panel';
import { useSearchParams } from 'next/navigation';
import React from 'react';

export default React.memo(function BrandMessages() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const chatId = searchParams?.get('chatId') || undefined;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    
    console.log('🔔 Fetching messages for brand:', user.uid);
    const unsubscribe = subscribeToUserConversations(user.uid, (convs) => {
      console.log('📨 BrandMessages received conversations:', convs);
      console.log('📨 Conversation details:', convs.map(c => ({
        id: c.id,
        participants: c.participants,
        participantNames: Object.values(c.participantInfo).map(p => p.name),
        lastMessage: c.lastMessage?.text?.substring(0, 30) + '...'
      })));
      setConversations(convs);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#FDFCF9'}}>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-red-burgundy/10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-burgundy mx-auto"></div>
          <p className="text-red-burgundy font-serif mt-4 text-center">Loading conversations...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="h-screen flex flex-col" style={{backgroundColor: '#FDFCF9'}}>
      {/* Main messaging area */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-burgundy"></div>
          </div>
        ) : (
          <MessagingPanel 
            userRole="brand" 
            selectedConversationId={chatId}
          />
                )}
              </div>
    </div>
  );
});// review trigger
