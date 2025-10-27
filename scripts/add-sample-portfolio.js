// Script to add sample portfolio data to a creator profile
// Run this with: node scripts/add-sample-portfolio.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to set up service account)
// This is just a template - adjust paths as needed

const samplePortfolioItems = [
  {
    id: 'portfolio_001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
    title: 'Mountain Adventure in Swiss Alps',
    description: 'Content collaboration with Alpine Travel Co.',
    uploadedAt: new Date().toISOString(),
    order: 0
  },
  {
    id: 'portfolio_002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3',
    title: 'Luxury Beach Resort',
    description: 'Campaign for Paradise Hotels',
    uploadedAt: new Date().toISOString(),
    order: 1
  },
  {
    id: 'portfolio_003',
    type: 'video',
    url: 'https://example.com/sample-video.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
    title: 'City Exploration Vlog',
    description: 'Travel vlog for Urban Adventures',
    uploadedAt: new Date().toISOString(),
    order: 2
  },
  {
    id: 'portfolio_004',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
    title: 'Desert Sunset',
    description: 'Sponsored content for Adventure Gear',
    uploadedAt: new Date().toISOString(),
    order: 3
  },
  {
    id: 'portfolio_005',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
    title: 'Northern Lights Norway',
    description: 'Winter campaign collaboration',
    uploadedAt: new Date().toISOString(),
    order: 4
  },
  {
    id: 'portfolio_006',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    title: 'Tropical Paradise',
    description: 'Island getaway content',
    uploadedAt: new Date().toISOString(),
    order: 5
  }
];

async function addPortfolioToCreator(creatorId) {
  try {
    const db = admin.firestore();
    const creatorRef = db.collection('users').doc(creatorId);
    
    await creatorRef.update({
      portfolio: samplePortfolioItems
    });
    
    console.log('✅ Sample portfolio items added successfully!');
  } catch (error) {
    console.error('❌ Error adding portfolio items:', error);
  }
}

// Example usage:
// addPortfolioToCreator('UJ7NJTUTwWPcLbPGOXzDAoORRmj1');

module.exports = { addPortfolioToCreator, samplePortfolioItems };

