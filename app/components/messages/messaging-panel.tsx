'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { 
  subscribeToUserConversations, 
  subscribeToConversationMessages, 
  sendMessage,
  sendOfferMessage,
  updateTypingStatus,
  subscribeToTypingStatus,
  markMessagesAsRead,
  acceptOffer,
  rejectOffer,
  Conversation,
  Message 
} from '@/app/lib/firebase/messages';
import { getUserDocument } from '@/app/lib/firebase/utils';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import OfferModal from './offer-modal';
import OfferMessage from './offer-message';

interface MessagingPanelProps {
  userRole: 'brand' | 'creator';
  selectedConversationId?: string;
}

export default function MessagingPanel({ userRole, selectedConversationId }: MessagingPanelProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [dragging, setDragging] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [otherUserInfo, setOtherUserInfo] = useState<{name: string; profilePic?: string} | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Get current user role from auth context
  const currentUserRole = user?.role || 'creator';

  // Subscribe to conversations
  useEffect(() => {
    if (!user?.uid) return;
    
    console.log('🔔 MessagingPanel setting up conversations subscription for:', user.uid);
    const unsubscribe = subscribeToUserConversations(user.uid, (convs) => {
      console.log('📨 MessagingPanel received conversations:', convs);
      console.log('📊 MessagingPanel conversation count:', convs.length);
      setConversations(convs);
      setLoading(false);
      
      // Auto-select conversation if provided
      if (selectedConversationId && convs.length > 0) {
        const conv = convs.find(c => c.id === selectedConversationId);
        if (conv) {
          console.log('🎯 Auto-selecting conversation:', conv.id);
          setSelectedConversation(conv);
        } else {
          console.log('⚠️  Could not find conversation with ID:', selectedConversationId);
        }
      }
    });
    
    return () => unsubscribe();
  }, [user?.uid, selectedConversationId]);

  // Subscribe to messages for selected conversation
  useEffect(() => {
    if (!selectedConversation?.id) {
      setMessages([]);
      return;
    }
    
    console.log('Setting up messages subscription for conversation:', selectedConversation.id);
    const unsubscribe = subscribeToConversationMessages(selectedConversation.id, (msgs) => {
      console.log('Received messages:', msgs);
      setMessages(msgs);
      
      // Mark messages as read when viewing conversation
      if (user?.uid) {
        console.log('📖 AUTO-MARKING MESSAGES AS READ for conversation:', selectedConversation.id);
        markMessagesAsRead(selectedConversation.id, user.uid).catch(console.error);
      }
    });
    
    return () => unsubscribe();
  }, [selectedConversation?.id, user?.uid]);

  // Subscribe to typing status for selected conversation
  useEffect(() => {
    if (!selectedConversation?.id || !user?.uid) {
      console.log('🔔 TYPING SUBSCRIPTION SKIPPED:', {
        hasConversation: !!selectedConversation?.id,
        hasUser: !!user?.uid
      });
      setIsOtherUserTyping(false);
      return;
    }
    
    console.log('🔔 Setting up typing status subscription for conversation:', {
      conversationId: selectedConversation.id,
      currentUserId: user.uid,
      timestamp: new Date().toISOString()
    });
    
    const unsubscribe = subscribeToTypingStatus(selectedConversation.id, user.uid, (isTyping) => {
      console.log('👀 TYPING STATUS CALLBACK RECEIVED:', {
        isTyping,
        conversationId: selectedConversation.id,
        currentUserId: user.uid,
        timestamp: new Date().toISOString()
      });
      
      // Force re-render by logging state change
      console.log('🎯 UPDATING isOtherUserTyping STATE:', isOtherUserTyping, '->', isTyping);
      setIsOtherUserTyping(isTyping);
    });
    
    return () => {
      console.log('🔔 CLEANING UP TYPING SUBSCRIPTION for:', selectedConversation.id);
      unsubscribe();
    };
  }, [selectedConversation?.id, user?.uid]);

  // Get other user info when conversation changes
  useEffect(() => {
    if (!selectedConversation || !user?.uid) {
      setOtherUserInfo(null);
      return;
    }
    
    const otherUserId = selectedConversation.participants.find(id => id !== user.uid);
    if (otherUserId) {
      getUserDocument(otherUserId).then(userData => {
        if (userData) {
          setOtherUserInfo({
            name: userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}`
              : userData.email || 'User',
            profilePic: userData.profileImageUrl
          });
        }
      }).catch(console.error);
    }
  }, [selectedConversation, user?.uid]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup typing status on unmount or conversation change
  useEffect(() => {
    return () => {
      if (selectedConversation?.id && user?.uid) {
        updateTypingStatus(selectedConversation.id, user.uid, false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedConversation?.id, user?.uid]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user?.uid || sending) return;
    
    const otherUserId = selectedConversation.participants.find(id => id !== user.uid);
    if (!otherUserId) return;
    
    try {
      setSending(true);
      console.log('📤 SENDING MESSAGE:', {
        messageText: messageText.substring(0, 50) + '...',
        conversationId: selectedConversation.id,
        senderId: user.uid,
        receiverId: otherUserId,
        timestamp: new Date().toISOString()
      });
      
      // Clear typing status when sending
      if (selectedConversation.id) {
        console.log('⌨️  CLEARING TYPING STATUS on send');
        await updateTypingStatus(selectedConversation.id, user.uid, false);
        console.log('✅ TYPING STATUS CLEARED on send');
      }
      
      const senderName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.email || 'User';
      
      await sendMessage(user.uid, otherUserId, messageText, senderName, user.profileImageUrl);
      setMessageText('');
      console.log('✅ MESSAGE SENT SUCCESSFULLY');
    } catch (error) {
      console.error('💥 Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Handle typing status
  const handleInputChange = async (value: string) => {
    console.log('⌨️  INPUT CHANGE:', {
      valueLength: value.length,
      hasTrim: !!value.trim(),
      conversationId: selectedConversation?.id,
      userId: user?.uid,
      timestamp: new Date().toISOString()
    });
    
    setMessageText(value);
    
    if (!selectedConversation?.id || !user?.uid) {
      console.log('⌨️  SKIPPING TYPING STATUS - missing conversation or user');
      return;
    }
    
    // Update typing status when user starts typing
    if (value.trim()) {
      console.log('⌨️  USER IS TYPING - setting typing status to TRUE');
      try {
        await updateTypingStatus(selectedConversation.id, user.uid, true);
        console.log('✅ TYPING STATUS SET TO TRUE via input');
      } catch (error) {
        console.error('💥 ERROR setting typing status:', error);
      }
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      console.log('⌨️  CLEARING PREVIOUS TYPING TIMEOUT');
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing status after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      console.log('⌨️  TYPING TIMEOUT TRIGGERED - setting typing status to FALSE');
      if (selectedConversation?.id && user?.uid) {
        try {
          await updateTypingStatus(selectedConversation.id, user.uid, false);
          console.log('✅ TYPING STATUS SET TO FALSE via timeout');
        } catch (error) {
          console.error('💥 ERROR clearing typing status via timeout:', error);
        }
      }
    }, 3000);
  };

  // Draggable gutter handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    document.body.style.cursor = 'col-resize';
  };
  const handleMouseUp = () => {
    setDragging(false);
    document.body.style.cursor = '';
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    const min = 220, max = 500;
    setSidebarWidth(Math.min(max, Math.max(min, e.clientX)));
  };
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  // Handle offer submission
  const handleOfferSubmit = async (offerData: {
    trip: {
      id: string;
      destination: string;
      country: string;
      startDate: string;
      endDate: string;
    };
    description: string;
    price: number;
  }) => {
    if (!selectedConversation || !user?.uid) return;
    
    const otherUserId = selectedConversation.participants.find(id => id !== user.uid);
    if (!otherUserId) return;
    
    try {
      console.log('💼 Sending collaboration offer:', offerData);
      
      const senderName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.email || 'User';
      
      await sendOfferMessage(user.uid, otherUserId, offerData, senderName, user.profileImageUrl);
      console.log('✅ Offer sent successfully');
    } catch (error) {
      console.error('💥 Error sending offer:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-burgundy mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full flex flex-col md:flex-row border border-gray-100">
      {/* Left sidebar - conversation list */}
      <div
        className="h-full flex flex-col border-r border-gray-100 bg-white transition-all duration-300"
        style={{ 
          width: sidebarWidth, 
          minWidth: 220, 
          maxWidth: 500
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Start messaging creators to see conversations here</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {conversations.map((conv) => {
                const isSelected = conv.id === selectedConversation?.id;
                const otherUserId = conv.participants.find(id => id !== user?.uid);
                const participantInfo = otherUserId ? conv.participantInfo[otherUserId] : null;
                
                return (
                  <motion.li 
                    key={conv.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-red-burgundy/5 border-r-2 border-red-burgundy' : ''
                    }`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                            {participantInfo?.profilePic ? (
                              <Image
                                src={participantInfo.profilePic}
                                alt={participantInfo.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-red-burgundy/10 flex items-center justify-center">
                                <span className="text-red-burgundy font-medium">
                                  {participantInfo?.name?.[0]?.toUpperCase() || 'U'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {participantInfo?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {conv.lastMessage ? format(new Date(conv.lastMessage.timestamp), 'MMM d') : ''}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conv.lastMessage?.text || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Draggable gutter */}
      <div
        className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize hidden md:block"
        onMouseDown={handleMouseDown}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  {otherUserInfo?.profilePic ? (
                    <Image
                      src={otherUserInfo.profilePic}
                      alt={otherUserInfo.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-red-burgundy/10 flex items-center justify-center">
                      <span className="text-red-burgundy font-medium">
                        {otherUserInfo?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{otherUserInfo?.name || 'User'}</h3>
                  <p className="text-sm text-gray-500">
                    {isOtherUserTyping ? (
                      <span className="text-red-burgundy font-medium">typing...</span>
                    ) : (
                      selectedConversation.participants.length > 1 ? 'Active now' : 'User'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet</p>
                  <p className="text-sm mt-1">Start the conversation below</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isFromUser = message.senderId === user?.uid;
                  const timestamp = message.sentAt?.toDate?.() || new Date(message.sentAt);
                  
                  // Render offer messages differently
                  if (message.type === 'offer') {
                    const otherUserId = selectedConversation.participants.find(id => id !== user.uid);
                    
                    return (
                      <OfferMessage
                        key={index}
                        message={message}
                        isFromUser={isFromUser}
                        currentUserRole={currentUserRole}
                        currentUserId={user.uid}
                        otherUserId={otherUserId || ''}
                        onAccept={async (offerId) => {
                          try {
                            console.log('✅ Accepting offer:', offerId);
                            await acceptOffer(selectedConversation.id, offerId, user.uid);
                            console.log('✅ Offer accepted successfully');
                          } catch (error) {
                            console.error('💥 Error accepting offer:', error);
                          }
                        }}
                        onReject={async (offerId) => {
                          try {
                            console.log('❌ Rejecting offer:', offerId);
                            await rejectOffer(selectedConversation.id, offerId, user.uid);
                            console.log('❌ Offer rejected successfully');
                          } catch (error) {
                            console.error('💥 Error rejecting offer:', error);
                          }
                        }}
                      />
                    );
                  }
                  
                  // Render system messages
                  if (message.type === 'system') {
                    // Use perspective-aware text if available
                    let displayText = message.text;
                    if (message.systemMessageData) {
                      displayText = userRole === 'creator' 
                        ? message.systemMessageData.creatorText 
                        : message.systemMessageData.brandText;
                    }
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-center mb-4"
                      >
                        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm max-w-md text-center">
                          {displayText}
                        </div>
                      </motion.div>
                    );
                  }
                  
                  // Render regular text messages
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        isFromUser 
                          ? 'bg-red-burgundy text-white' 
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <div className={`flex items-center justify-between mt-1 ${
                          isFromUser ? 'text-red-burgundy/70' : 'text-gray-500'
                        }`}>
                          <p className="text-xs">
                            {format(timestamp, 'MMM d, h:mm a')}
                          </p>
                          {isFromUser && (
                            <div className="flex items-center space-x-1 ml-2">
                              {/* Show double checkmarks for read messages, single for delivered */}
                              {message.status === 'read' ? (
                                <div className="flex">
                                  {/* Double checkmark for read */}
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <svg className="w-3 h-3 text-white -ml-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : (
                                /* Single checkmark for delivered */
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              
              {/* Typing indicator */}
              {isOtherUserTyping && (
                <>
                  {console.log('🎨 RENDERING TYPING INDICATOR:', {
                    isOtherUserTyping,
                    otherUserName: otherUserInfo?.name,
                    conversationId: selectedConversation?.id,
                    timestamp: new Date().toISOString()
                  })}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white text-gray-900 border border-gray-200 px-4 py-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                {/* Collaboration button for brands - compact design */}
                {currentUserRole === 'brand' && (
                  <button
                    onClick={() => setIsOfferModalOpen(true)}
                    className="flex-shrink-0 bg-red-burgundy text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-burgundy/90 transition-colors flex items-center gap-1.5"
                    title="Propose Collaboration"
                  >
                    <span className="text-sm">💼</span>
                    <span className="hidden sm:inline">Offer</span>
                  </button>
                )}
                
                {/* Message input */}
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy bg-gray-50 transition-colors"
                    disabled={sending}
                  />
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sending}
                    className="flex-shrink-0 bg-red-burgundy text-white w-10 h-10 rounded-full hover:bg-red-burgundy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    title="Send message"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Offer Modal */}
      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSubmit={handleOfferSubmit}
        creatorId={selectedConversation ? selectedConversation.participants.find(id => id !== user?.uid) : undefined}
        creatorName={otherUserInfo?.name}
      />
    </div>
  );
} 