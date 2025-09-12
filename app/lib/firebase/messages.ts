import { getUserDocument } from '@/app/lib/firebase/utils';
import { db } from '@/app/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp,
  setDoc
} from 'firebase/firestore';

export interface Message {
  text?: string;
  senderId: string;
  sentAt: Timestamp;
  deliveredAt?: Timestamp;
  readAt?: Timestamp;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  // Offer-specific fields
  type?: 'text' | 'offer' | 'system';
  offerId?: string;
  trip?: {
    id: string;
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
  };
  description?: string;
  price?: number;
  offerStatus?: 'pending' | 'accepted' | 'rejected' | 'paid';
  // Payment data (added when payment is completed)
  paymentData?: {
    stripeSessionId: string;
    amountPaid: number;
    paidAt: Date;
  };
  // System message data for perspective-aware messages
  systemMessageData?: {
    type: string;
    creatorText: string;
    brandText: string;
  };
}

export interface MessageThread {
  id?: string;
  participants: string[];
  creatorId: string;
  brandId: string;
  messages: Message[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  participantInfo?: {
    [key: string]: {
      name: string;
      profilePic?: string;
      role: 'brand' | 'creator';
    }
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  participantInfo: {
    [key: string]: {
      name: string;
      profilePic?: string;
      role: 'brand' | 'creator';
    }
  };
  lastMessage?: {
    text: string;
    timestamp: number;
    senderId: string;
  };
  updatedAt: number;
}

/**
 * Get conversation ID from brand and creator IDs
 */
export function getConversationId(userId1: string, userId2: string): string {
  // Sort IDs to ensure consistency regardless of who initiates
  return [userId1, userId2].sort().join('_');
}

/**
 * Send a message in a conversation using the single thread approach
 */
export async function sendMessage(
  senderId: string, 
  receiverId: string, 
  text: string,
  senderName: string = 'Anonymous',
  senderProfilePic?: string
): Promise<void> {
  if (!text.trim()) return;
  
  try {
    console.log('🔥 SENDING MESSAGE:', {
    senderId,
    receiverId,
      text: text.substring(0, 50) + '...',
    senderName,
      senderProfilePic
    });
    
    const messageThreadsRef = collection(db, 'messageThreads');
    
    // Check if a thread already exists between these users
    console.log('🔍 Checking for existing thread...');
    const q = query(
      messageThreadsRef,
      where('participants', 'array-contains', senderId)
    );
    
    const querySnapshot = await getDocs(q);
    let existingThread: any = null;
    
    console.log('📊 Found', querySnapshot.size, 'potential threads');
    
    // Find thread that contains both participants
    querySnapshot.forEach((docSnapshot) => {
      const threadData = docSnapshot.data();
      console.log('🔍 Checking thread:', docSnapshot.id, 'participants:', threadData.participants);
      
      // Check if this thread contains BOTH the sender and receiver
      const containsSender = threadData.participants.includes(senderId);
      const containsReceiver = threadData.participants.includes(receiverId);
      
      console.log('🔍 Thread participant check:', {
        threadId: docSnapshot.id,
        containsSender,
        containsReceiver,
        participants: threadData.participants
      });
      
      if (containsSender && containsReceiver) {
        existingThread = { id: docSnapshot.id, ...threadData };
        console.log('✅ Found existing thread:', docSnapshot.id);
      }
    });
    
    const newMessage: Message = {
      type: 'text',
      text,
      senderId,
      sentAt: Timestamp.now(),
      deliveredAt: Timestamp.now(),
      status: 'delivered'
    };
    
    console.log('📝 New message object:', newMessage);
    
    if (existingThread) {
      console.log('📝 Updating existing thread:', existingThread.id);
      // Append to existing thread
      const threadRef = doc(db, 'messageThreads', existingThread.id);
      const updatedMessages = [...existingThread.messages, newMessage];
      
      console.log('📝 Current messages count:', existingThread.messages.length);
      console.log('📝 Updated messages count:', updatedMessages.length);
      
      await updateDoc(threadRef, {
        messages: updatedMessages,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Successfully updated existing thread');
    } else {
      console.log('🆕 Creating new thread...');
      // Create new thread
      // Get user documents to determine roles
      console.log('👤 Getting user documents for roles...');
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const receiverDoc = await getDoc(doc(db, 'users', receiverId));
      
      const senderRole = senderDoc.exists() ? senderDoc.data()?.role : 'creator';
      const receiverRole = receiverDoc.exists() ? receiverDoc.data()?.role : 'creator';
      
      console.log('👤 Sender role:', senderRole, 'Receiver role:', receiverRole);
      
      // Get user names for participant info
      const senderData = senderDoc.exists() ? senderDoc.data() : null;
      const receiverData = receiverDoc.exists() ? receiverDoc.data() : null;
      
      const senderDisplayName = senderData?.brandName 
        ? senderData.brandName
        : (senderData?.firstName && senderData?.lastName 
          ? `${senderData.firstName} ${senderData.lastName}`
          : senderData?.email || 'User');
      
      const receiverDisplayName = receiverData?.brandName 
        ? receiverData.brandName
        : (receiverData?.firstName && receiverData?.lastName 
          ? `${receiverData.firstName} ${receiverData.lastName}`
          : receiverData?.email || 'User');
      
      console.log('👤 Display names - Sender:', senderDisplayName, 'Receiver:', receiverDisplayName);
      
      const threadData: Omit<MessageThread, 'id'> = {
        participants: [senderId, receiverId],
        creatorId: senderRole === 'creator' ? senderId : receiverId,
        brandId: senderRole === 'brand' ? senderId : receiverId,
        messages: [newMessage],
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        participantInfo: {
          [senderId]: {
            name: senderDisplayName,
            profilePic: senderData?.profileImageUrl || null,
            role: senderRole
          },
          [receiverId]: {
            name: receiverDisplayName,
            profilePic: receiverData?.profileImageUrl || null,
            role: receiverRole
          }
        }
      };
      
      console.log('🆕 Thread data to create:', {
        participants: threadData.participants,
        creatorId: threadData.creatorId,
        brandId: threadData.brandId,
        messageCount: threadData.messages.length,
        participantInfo: threadData.participantInfo
      });
      
      // Debug: Check for undefined values
      console.log('🔍 Debugging threadData for undefined values:', JSON.stringify(threadData, null, 2));
      
      const docRef = await addDoc(messageThreadsRef, threadData);
      console.log('✅ Successfully created new thread with ID:', docRef.id);
    }
    
    console.log('🎉 Message sent successfully!');
  } catch (error) {
    console.error('💥 Error sending message:', error);
    throw error;
  }
}

/**
 * Get or create a conversation (legacy function for compatibility)
 */
export const getOrCreateConversation = async (userId1: string, userId2: string) => {
  return getConversationId(userId1, userId2);
};

/**
 * Mark all messages in a conversation as read for a specific user
 */
export async function markConversationAsRead(conversationId: string, userId: string): Promise<void> {
  // For the new structure, we don't track read status per message
  // This function is kept for compatibility but doesn't do anything
  console.log('markConversationAsRead called but not implemented in new structure');
}

/**
 * Get user's conversations with real-time updates
 */
export function subscribeToUserConversations(
  userId: string, 
  callback: (conversations: Conversation[]) => void
): () => void {
  console.log('🔔 Setting up conversation subscription for user:', userId);
  
  const messageThreadsRef = collection(db, 'messageThreads');
  const q = query(
    messageThreadsRef,
    where('participants', 'array-contains', userId)
    // Temporarily removing orderBy until Firestore index is fully ready
    // orderBy('updatedAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    console.log('📨 Received snapshot with', snapshot.size, 'documents');
    const conversations: Conversation[] = [];
    
    snapshot.forEach((docSnapshot) => {
      try {
        const threadData = docSnapshot.data();
        console.log('🔍 Processing thread:', docSnapshot.id, {
          participants: threadData.participants,
          messageCount: threadData.messages?.length || 0,
          hasParticipantInfo: !!threadData.participantInfo,
          updatedAt: threadData.updatedAt
        });
        
        const otherUserId = threadData.participants.find((id: string) => id !== userId);
        
        if (otherUserId && threadData.messages && threadData.messages.length > 0) {
          const lastMessage = threadData.messages[threadData.messages.length - 1];
          
          console.log('👤 Other user ID:', otherUserId);
          console.log('💬 Last message:', {
            text: lastMessage.text?.substring(0, 30) + '...',
            senderId: lastMessage.senderId,
            timestamp: lastMessage.sentAt
          });
          
          const conversation: Conversation = {
            id: docSnapshot.id,
            participants: threadData.participants,
            participantInfo: {
              [otherUserId]: {
                name: threadData.participantInfo?.[otherUserId]?.name || 'User',
                profilePic: threadData.participantInfo?.[otherUserId]?.profilePic,
                role: threadData.participantInfo?.[otherUserId]?.role || 'creator'
              }
            },
            lastMessage: {
              text: lastMessage.type === 'offer' 
                ? `💼 Collaboration Offer - ${lastMessage.trip?.destination || 'Trip'}`
                : lastMessage.text || '',
              timestamp: lastMessage.sentAt?.toMillis() || Date.now(),
              senderId: lastMessage.senderId
            },
            updatedAt: threadData.updatedAt?.toMillis() || Date.now()
          };
          
          console.log('✅ Created conversation object:', {
            id: conversation.id,
            participantName: conversation.participantInfo[otherUserId]?.name,
            lastMessageText: conversation.lastMessage?.text?.substring(0, 30) + '...'
          });
          
          conversations.push(conversation);
        } else {
          console.log('⚠️  Skipping thread - missing otherUserId or no messages:', {
            hasOtherUser: !!otherUserId,
            messageCount: threadData.messages?.length || 0
          });
        }
      } catch (error) {
        console.error('💥 Error processing thread:', docSnapshot.id, error);
      }
    });
    
    console.log('📋 Final conversations list:', conversations.length, 'conversations');
    callback(conversations);
  }, (error) => {
    console.error('💥 Conversation subscription error:', error);
  });
  
  return unsubscribe;
}

/**
 * Subscribe to messages in a specific conversation
 */
export function subscribeToConversationMessages(
  conversationId: string, 
  callback: (messages: Message[]) => void
): () => void {
  console.log('💬 Setting up messages subscription for conversation:', conversationId);
  
  const threadRef = doc(db, 'messageThreads', conversationId);
  
  const unsubscribe = onSnapshot(threadRef, (docSnapshot) => {
    console.log('📬 Received message snapshot for conversation:', conversationId);
    
    if (docSnapshot.exists()) {
      const threadData = docSnapshot.data();
      const messages = threadData.messages || [];
      
      console.log('📨 Found', messages.length, 'messages in conversation');
      messages.forEach((msg: Message, index: number) => {
        console.log(`📝 Message ${index + 1}:`, {
          senderId: msg.senderId,
          text: msg.text?.substring(0, 30) + '...',
          timestamp: msg.sentAt
        });
    });
    
    callback(messages);
    } else {
      console.log('⚠️  Conversation document does not exist:', conversationId);
      callback([]);
    }
  }, (error) => {
    console.error('💥 Messages subscription error:', error);
  });
  
  return unsubscribe;
}

/**
 * Update conversation participant info
 */
export async function updateConversationParticipantInfo(
  conversationId: string,
  userId: string,
  info: {
    name: string;
    profilePic?: string;
    role: 'brand' | 'creator';
  }
): Promise<void> {
  // This function is kept for compatibility but may not be needed in the new structure
  console.log('updateConversationParticipantInfo called but not fully implemented');
}

/**
 * Initialize a conversation with participant info
 */
export async function initializeConversation(
  userId1: string,
  userId2: string,
  user1Info: {
    name: string;
    profilePic?: string;
    role: 'brand' | 'creator';
  },
  user2Info: {
    name: string;
    profilePic?: string;
    role: 'brand' | 'creator';
  }
): Promise<string> {
  const messageThreadsRef = collection(db, 'messageThreads');
  
  // Check if thread already exists
  const q = query(
    messageThreadsRef,
    where('participants', 'array-contains', userId1)
  );
  
  const querySnapshot = await getDocs(q);
  let existingThread: any = null;
  
  querySnapshot.forEach((docSnapshot) => {
    const threadData = docSnapshot.data();
    if (threadData.participants.includes(userId2)) {
      existingThread = { id: docSnapshot.id, ...threadData };
    }
  });
  
  if (existingThread) {
    return existingThread.id;
  }
  
  // Create new thread
  const threadData = {
        participants: [userId1, userId2],
    creatorId: user1Info.role === 'creator' ? userId1 : userId2,
    brandId: user1Info.role === 'brand' ? userId1 : userId2,
    messages: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
        participantInfo: {
          [userId1]: user1Info,
          [userId2]: user2Info
    }
  };
  
  const docRef = await addDoc(messageThreadsRef, threadData);
  return docRef.id;
}

// Legacy functions for compatibility
export const getUserConversations = (userId: string, callback: (conversations: any[]) => void) => {
  return subscribeToUserConversations(userId, callback);
};

export const getConversationMessages = (conversationId: string, callback: (messages: any[]) => void) => {
  return subscribeToConversationMessages(conversationId, callback);
};

/**
 * Mark messages as read when user views a conversation
 */
export async function markMessagesAsRead(
  conversationId: string,
  currentUserId: string
): Promise<void> {
  try {
    console.log('📖 MARKING MESSAGES AS READ:', {
      conversationId,
      currentUserId,
      timestamp: new Date().toISOString()
    });
    
    const threadRef = doc(db, 'messageThreads', conversationId);
    const threadDoc = await getDoc(threadRef);
    
    if (!threadDoc.exists()) {
      console.log('❌ Thread not found');
      return;
    }
    
    const threadData = threadDoc.data();
    const messages = threadData.messages || [];
    
    // Update messages that were sent by others and haven't been read yet
    let hasUpdates = false;
    const updatedMessages = messages.map((message: Message) => {
      // Only mark as read if it's from another user and not already read
      if (message.senderId !== currentUserId && !message.readAt) {
        console.log('📖 Marking message as read:', {
          messageText: message.text?.substring(0, 30) + '...',
          senderId: message.senderId
        });
        hasUpdates = true;
        return {
          ...message,
          readAt: Timestamp.now(),
          status: 'read' as const
        };
      }
      return message;
    });
    
    if (hasUpdates) {
      await updateDoc(threadRef, {
        messages: updatedMessages,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Messages marked as read successfully');
    } else {
      console.log('ℹ️  No new messages to mark as read');
    }
  } catch (error) {
    console.error('💥 Error marking messages as read:', error);
  }
}

export async function updateTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  try {
    console.log('⌨️  UPDATE TYPING STATUS:', {
      conversationId,
      userId,
      isTyping,
      timestamp: new Date().toISOString()
    });
    
    const typingRef = doc(db, 'typingStatus', `${conversationId}_${userId}`);
    
    if (isTyping) {
      console.log('⌨️  SETTING TYPING TRUE for document:', `${conversationId}_${userId}`);
      await setDoc(typingRef, {
        userId,
        conversationId,
        isTyping: true,
        timestamp: serverTimestamp()
      });
      console.log('✅ TYPING STATUS SET TO TRUE');
    } else {
      console.log('⌨️  DELETING TYPING STATUS for document:', `${conversationId}_${userId}`);
      await deleteDoc(typingRef);
      console.log('✅ TYPING STATUS DELETED');
    }
  } catch (error) {
    console.error('💥 ERROR updating typing status:', error);
    console.error('💥 Error details:', {
      conversationId,
      userId,
      isTyping,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export function subscribeToTypingStatus(
  conversationId: string,
  userId: string,
  callback: (isTyping: boolean) => void
): () => void {
  console.log('🔔 SUBSCRIBING TO TYPING STATUS:', {
    conversationId,
    excludeUserId: userId,
    timestamp: new Date().toISOString()
  });
  
  const typingRef = collection(db, 'typingStatus');
  // Simplified query - just filter by conversation
  const q = query(
    typingRef,
    where('conversationId', '==', conversationId)
  );
  
  console.log('🔔 TYPING QUERY CREATED:', {
    collection: 'typingStatus',
    conversationId,
    excludeUserId: userId
  });
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    console.log('📬 TYPING STATUS SNAPSHOT RECEIVED:', {
      size: snapshot.size,
      empty: snapshot.empty,
      conversationId,
      timestamp: new Date().toISOString()
    });
    
    let isOtherUserTyping = false;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('👀 TYPING DOCUMENT FOUND:', {
        id: doc.id,
        data: data,
        userId: data.userId,
        isTyping: data.isTyping
      });
      
      // Check if this is from another user and they're typing
      if (data.userId !== userId && data.isTyping === true) {
        isOtherUserTyping = true;
      }
    });
    
    console.log('👀 FINAL TYPING STATUS RESULT:', {
      isOtherUserTyping,
      conversationId,
      excludeUserId: userId
    });
    
    callback(isOtherUserTyping);
  }, (error) => {
    console.error('💥 TYPING STATUS SUBSCRIPTION ERROR:', error);
    console.error('💥 Typing subscription error details:', {
      conversationId,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    callback(false);
  });
  
  return unsubscribe;
}

/**
 * Test function to check if typingStatus collection is accessible
 */
export async function testTypingStatusAccess(userId: string): Promise<boolean> {
  try {
    console.log('🧪 TESTING TYPING STATUS ACCESS for user:', userId);
    
    // Try to write a test document
    const testRef = doc(db, 'typingStatus', `test_${userId}_${Date.now()}`);
    await setDoc(testRef, {
      userId,
      conversationId: 'test',
      isTyping: true,
      timestamp: serverTimestamp()
    });
    console.log('✅ WRITE TEST SUCCESSFUL');
    
    // Try to delete it
    await deleteDoc(testRef);
    console.log('✅ DELETE TEST SUCCESSFUL');
    
    // Try to query the collection
    const typingRef = collection(db, 'typingStatus');
    const q = query(typingRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    console.log('✅ QUERY TEST SUCCESSFUL, docs:', snapshot.size);
    
    return true;
  } catch (error) {
    console.error('💥 TYPING STATUS ACCESS TEST FAILED:', error);
    return false;
  }
}

/**
 * Send a collaboration offer message
 */
export async function sendOfferMessage(
  senderId: string,
  receiverId: string,
  offerData: {
    trip: {
      id: string;
      destination: string;
      country: string;
      startDate: string;
      endDate: string;
    };
    description: string;
    price: number;
  },
  senderName: string = 'Anonymous',
  senderProfilePic?: string
): Promise<void> {
  try {
    console.log('💼 SENDING OFFER MESSAGE:', {
      senderId,
      receiverId,
      trip: offerData.trip.destination,
      price: offerData.price,
      description: offerData.description.substring(0, 50) + '...'
    });

    // Generate unique offer ID
    const offerId = `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const messageThreadsRef = collection(db, 'messageThreads');
    
    // Check if a thread already exists between these users
    console.log('🔍 Checking for existing thread...');
    const q = query(
      messageThreadsRef,
      where('participants', 'array-contains', senderId)
    );
    
    const querySnapshot = await getDocs(q);
    let existingThread: any = null;
    
    console.log('📊 Found', querySnapshot.size, 'potential threads');
    
    // Find thread that contains both participants
    querySnapshot.forEach((docSnapshot) => {
      const threadData = docSnapshot.data();
      console.log('🔍 Checking thread:', docSnapshot.id, 'participants:', threadData.participants);
      
      // Check if this thread contains BOTH the sender and receiver
      const containsSender = threadData.participants.includes(senderId);
      const containsReceiver = threadData.participants.includes(receiverId);
      
      if (containsSender && containsReceiver) {
        existingThread = { id: docSnapshot.id, ...threadData };
        console.log('✅ Found existing thread:', docSnapshot.id);
      }
    });
    
    const newOfferMessage: Message = {
      type: 'offer',
      offerId,
      trip: offerData.trip,
      description: offerData.description,
      price: offerData.price,
      senderId,
      sentAt: Timestamp.now(),
      deliveredAt: Timestamp.now(),
      status: 'delivered',
      offerStatus: 'pending'
    };
    
    console.log('💼 New offer message object:', newOfferMessage);
    
    if (existingThread) {
      console.log('📝 Updating existing thread with offer:', existingThread.id);
      // Append to existing thread
      const threadRef = doc(db, 'messageThreads', existingThread.id);
      const updatedMessages = [...existingThread.messages, newOfferMessage];
      
      await updateDoc(threadRef, {
        messages: updatedMessages,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Successfully updated existing thread with offer');
    } else {
      console.log('🆕 Creating new thread with offer...');
      // Create new thread - same logic as regular messages but with offer
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const receiverDoc = await getDoc(doc(db, 'users', receiverId));
      
      const senderRole = senderDoc.exists() ? senderDoc.data()?.role : 'brand';
      const receiverRole = receiverDoc.exists() ? receiverDoc.data()?.role : 'creator';
      
      const senderData = senderDoc.exists() ? senderDoc.data() : null;
      const receiverData = receiverDoc.exists() ? receiverDoc.data() : null;
      
      const senderDisplayName = senderData?.firstName && senderData?.lastName 
        ? `${senderData.firstName} ${senderData.lastName}`
        : senderData?.email || 'User';
      
      const receiverDisplayName = receiverData?.firstName && receiverData?.lastName 
        ? `${receiverData.firstName} ${receiverData.lastName}`
        : receiverData?.email || 'User';
      
      const threadData: Omit<MessageThread, 'id'> = {
        participants: [senderId, receiverId],
        creatorId: senderRole === 'creator' ? senderId : receiverId,
        brandId: senderRole === 'brand' ? senderId : receiverId,
        messages: [newOfferMessage],
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        participantInfo: {
          [senderId]: {
            name: senderDisplayName,
            profilePic: senderData?.profileImageUrl || null,
            role: senderRole
          },
          [receiverId]: {
            name: receiverDisplayName,
            profilePic: receiverData?.profileImageUrl || null,
            role: receiverRole
          }
        }
      };
      
      const docRef = await addDoc(messageThreadsRef, threadData);
      console.log('✅ Successfully created new thread with offer, ID:', docRef.id);
    }
    
    console.log('🎉 Offer message sent successfully!');
  } catch (error) {
    console.error('💥 Error sending offer message:', error);
    throw error;
  }
}

/**
 * Accept a collaboration offer
 */
export async function acceptOffer(
  conversationId: string,
  offerId: string,
  userId: string
): Promise<void> {
  try {
    console.log('✅ ACCEPTING OFFER:', { conversationId, offerId, userId });
    
    const messageThreadsRef = collection(db, 'messageThreads');
    const q = query(messageThreadsRef, where('participants', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    
    let targetThread: any = null;
    
    // Find the thread that matches the conversation
    querySnapshot.forEach((docSnapshot) => {
      const threadData = docSnapshot.data();
      const threadId = docSnapshot.id;
      
      // Check if this is the right conversation by comparing participants or ID
      if (threadId === conversationId || 
          (threadData.participants && threadData.participants.length === 2)) {
        targetThread = { id: threadId, ...threadData };
      }
    });
    
    if (!targetThread) {
      throw new Error('Conversation thread not found');
    }
    
    console.log('📝 Found target thread:', targetThread.id);
    
    // Update the specific offer message status
    const updatedMessages = targetThread.messages.map((message: Message) => {
      if (message.offerId === offerId) {
        console.log('🎯 Updating offer message status to accepted');
        return {
          ...message,
          offerStatus: 'accepted'
        };
      }
      return message;
    });
    
    // Add system message about acceptance - perspective-aware
    const systemMessage: Message = {
      type: 'system',
      text: 'Offer accepted. Waiting for payment...',
      senderId: 'system',
      sentAt: Timestamp.now(),
      deliveredAt: Timestamp.now(),
      status: 'delivered',
      // Add metadata to make it perspective-aware
      systemMessageData: {
        type: 'offer_accepted',
        creatorText: 'You accepted the offer. Waiting for payment from brand...',
        brandText: 'Creator accepted the offer. Waiting for payment...'
      }
    };
    
    updatedMessages.push(systemMessage);
    
    // Update the thread
    const threadRef = doc(db, 'messageThreads', targetThread.id);
    await updateDoc(threadRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp()
    });

    // Create a pending order that will show in earnings
    // Find the accepted offer message to get the details
    const acceptedOffer = updatedMessages.find((msg: any) => msg.offerId === offerId && msg.type === 'offer');
    if (acceptedOffer) {
      const orderData = {
        id: offerId,
        brandId: acceptedOffer.senderId, // The sender of the offer is the brand
        creatorId: userId, // The user accepting is the creator  
        amount: acceptedOffer.price,
        currency: 'usd',
        tripDestination: acceptedOffer.trip?.destination || '',
        tripCountry: acceptedOffer.trip?.country || '',
        status: 'pending' as const, // pending -> paid -> in_progress -> completed
        description: acceptedOffer.description || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      try {
        await setDoc(doc(db, 'orders', offerId), orderData);
        console.log('✅ Created pending order for accepted offer:', offerId);
      } catch (error) {
        console.error('❌ Error creating pending order:', error);
        // Don't throw here, as the main offer acceptance should still succeed
      }
    }
    
    console.log('✅ Offer accepted successfully');
  } catch (error) {
    console.error('💥 Error accepting offer:', error);
    throw error;
  }
}

/**
 * Reject a collaboration offer
 */
export async function rejectOffer(
  conversationId: string,
  offerId: string,
  userId: string
): Promise<void> {
  try {
    console.log('❌ REJECTING OFFER:', { conversationId, offerId, userId });
    
    const messageThreadsRef = collection(db, 'messageThreads');
    const q = query(messageThreadsRef, where('participants', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    
    let targetThread: any = null;
    
    // Find the thread that matches the conversation
    querySnapshot.forEach((docSnapshot) => {
      const threadData = docSnapshot.data();
      const threadId = docSnapshot.id;
      
      // Check if this is the right conversation by comparing participants or ID
      if (threadId === conversationId || 
          (threadData.participants && threadData.participants.length === 2)) {
        targetThread = { id: threadId, ...threadData };
      }
    });
    
    if (!targetThread) {
      throw new Error('Conversation thread not found');
    }
    
    console.log('📝 Found target thread:', targetThread.id);
    
    // Update the specific offer message status
    const updatedMessages = targetThread.messages.map((message: Message) => {
      if (message.offerId === offerId) {
        console.log('🎯 Updating offer message status to rejected');
        return {
          ...message,
          offerStatus: 'rejected'
        };
      }
      return message;
    });
    
    // Add system message about rejection
    const systemMessage: Message = {
      type: 'system',
      text: 'Creator declined the collaboration offer.',
      senderId: 'system',
      sentAt: Timestamp.now(),
      deliveredAt: Timestamp.now(),
      status: 'delivered'
    };
    
    updatedMessages.push(systemMessage);
    
    // Update the thread
    const threadRef = doc(db, 'messageThreads', targetThread.id);
    await updateDoc(threadRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp()
    });
    
    console.log('❌ Offer rejected successfully');
  } catch (error) {
    console.error('💥 Error rejecting offer:', error);
    throw error;
  }
} // review trigger
