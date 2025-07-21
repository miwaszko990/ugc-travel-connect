const { database } = require('@/app/lib/firebase');
const { ref, set } = require('firebase/database');
const { getConversationId } = require('./messages');

// Demo users
const demoCreator = {
  uid: 'demo_creator_1',
  firstName: 'Maria',
  lastName: 'Iwasszko',
  profileImageUrl: '/demo/creator1.jpg',
  role: 'creator',
  homeCity: 'Paris',
  instagramHandle: 'mariawanderlust'
};

const demoBrand = {
  uid: 'demo_brand_1',
  name: 'Luxury Escapes',
  logoUrl: '/demo/brand1.jpg',
  role: 'brand'
};

// Demo conversation with messages
const demoConversation = {
  participants: [demoCreator.uid, demoBrand.uid],
  participantInfo: {
    [demoCreator.uid]: {
      name: `${demoCreator.firstName} ${demoCreator.lastName}`,
      profilePic: demoCreator.profileImageUrl,
      role: 'creator',
      instagram: demoCreator.instagramHandle
    },
    [demoBrand.uid]: {
      name: demoBrand.name,
      profilePic: demoBrand.logoUrl,
      role: 'brand'
    }
  },
  messages: {
    msg1: {
      senderId: demoBrand.uid,
      senderName: demoBrand.name,
      senderProfilePic: demoBrand.logoUrl,
      receiverId: demoCreator.uid,
      text: "Hi Maria! We love your travel content and would be interested in collaborating with you for our luxury destinations.",
      timestamp: Date.now() - 86400000, // 1 day ago
      read: true
    },
    msg2: {
      senderId: demoCreator.uid,
      senderName: `${demoCreator.firstName} ${demoCreator.lastName}`,
      senderProfilePic: demoCreator.profileImageUrl,
      receiverId: demoBrand.uid,
      text: "Thank you! I'd love to hear more about the collaboration opportunity. What destinations did you have in mind?",
      timestamp: Date.now() - 82800000, // 23 hours ago
      read: true
    },
    msg3: {
      senderId: demoBrand.uid,
      senderName: demoBrand.name,
      senderProfilePic: demoBrand.logoUrl,
      receiverId: demoCreator.uid,
      text: "We're launching new luxury experiences in the Maldives and Bali. Would you be interested in creating content for these destinations?",
      timestamp: Date.now() - 3600000, // 1 hour ago
      read: false
    }
  },
  lastMessage: {
    text: "We're launching new luxury experiences in the Maldives and Bali. Would you be interested in creating content for these destinations?",
    timestamp: Date.now() - 3600000,
    senderId: demoBrand.uid
  },
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now() - 3600000
};

async function initializeDemoData() {
  try {
    const conversationId = getConversationId(demoCreator.uid, demoBrand.uid);
    const conversationRef = ref(database, `messages/${conversationId}`);
    
    // Initialize the demo conversation
    await set(conversationRef, demoConversation);
    
    console.log('Demo data initialized successfully!');
    return {
      conversationId,
      demoCreator,
      demoBrand
    };
  } catch (error) {
    console.error('Error initializing demo data:', error);
    throw error;
  }
}

module.exports = {
  initializeDemoData
}; 
const { ref, set } = require('firebase/database');
const { getConversationId } = require('./messages');

// Demo users
const demoCreator = {
  uid: 'demo_creator_1',
  firstName: 'Maria',
  lastName: 'Iwasszko',
  profileImageUrl: '/demo/creator1.jpg',
  role: 'creator',
  homeCity: 'Paris',
  instagramHandle: 'mariawanderlust'
};

const demoBrand = {
  uid: 'demo_brand_1',
  name: 'Luxury Escapes',
  logoUrl: '/demo/brand1.jpg',
  role: 'brand'
};

// Demo conversation with messages
const demoConversation = {
  participants: [demoCreator.uid, demoBrand.uid],
  participantInfo: {
    [demoCreator.uid]: {
      name: `${demoCreator.firstName} ${demoCreator.lastName}`,
      profilePic: demoCreator.profileImageUrl,
      role: 'creator',
      instagram: demoCreator.instagramHandle
    },
    [demoBrand.uid]: {
      name: demoBrand.name,
      profilePic: demoBrand.logoUrl,
      role: 'brand'
    }
  },
  messages: {
    msg1: {
      senderId: demoBrand.uid,
      senderName: demoBrand.name,
      senderProfilePic: demoBrand.logoUrl,
      receiverId: demoCreator.uid,
      text: "Hi Maria! We love your travel content and would be interested in collaborating with you for our luxury destinations.",
      timestamp: Date.now() - 86400000, // 1 day ago
      read: true
    },
    msg2: {
      senderId: demoCreator.uid,
      senderName: `${demoCreator.firstName} ${demoCreator.lastName}`,
      senderProfilePic: demoCreator.profileImageUrl,
      receiverId: demoBrand.uid,
      text: "Thank you! I'd love to hear more about the collaboration opportunity. What destinations did you have in mind?",
      timestamp: Date.now() - 82800000, // 23 hours ago
      read: true
    },
    msg3: {
      senderId: demoBrand.uid,
      senderName: demoBrand.name,
      senderProfilePic: demoBrand.logoUrl,
      receiverId: demoCreator.uid,
      text: "We're launching new luxury experiences in the Maldives and Bali. Would you be interested in creating content for these destinations?",
      timestamp: Date.now() - 3600000, // 1 hour ago
      read: false
    }
  },
  lastMessage: {
    text: "We're launching new luxury experiences in the Maldives and Bali. Would you be interested in creating content for these destinations?",
    timestamp: Date.now() - 3600000,
    senderId: demoBrand.uid
  },
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now() - 3600000
};

async function initializeDemoData() {
  try {
    const conversationId = getConversationId(demoCreator.uid, demoBrand.uid);
    const conversationRef = ref(database, `messages/${conversationId}`);
    
    // Initialize the demo conversation
    await set(conversationRef, demoConversation);
    
    console.log('Demo data initialized successfully!');
    return {
      conversationId,
      demoCreator,
      demoBrand
    };
  } catch (error) {
    console.error('Error initializing demo data:', error);
    throw error;
  }
}

module.exports = {
  initializeDemoData
}; // review trigger
