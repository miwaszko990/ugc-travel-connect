# Portfolio System - Setup Guide

## Overview

I've added a Pinterest-style masonry portfolio system to your creator profile pages. Creators can now showcase their images and videos in an irregular, visually appealing grid layout.

## What I've Built

### 1. **Type Definitions** (`app/lib/types.ts`)
Added `PortfolioItem` interface:
```typescript
interface PortfolioItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string; // For videos
  title?: string;
  description?: string;
  uploadedAt: string;
  order?: number;
}
```

### 2. **Masonry Layout Component** (`app/components/creator/PortfolioMasonry.tsx`)
- Pinterest-style irregular grid using CSS columns
- Responsive: 1 column on mobile, 2 on tablet, 3 on desktop
- Click to open lightbox modal for full-screen viewing
- Video support with play button overlay
- Smooth hover effects

### 3. **Portfolio Management** (`app/lib/firebase/portfolio.ts`)
Firebase utilities for managing portfolio items:
- `uploadPortfolioFile()` - Upload images/videos to Firebase Storage
- `addPortfolioItem()` - Add item to creator's portfolio
- `removePortfolioItem()` - Remove item from portfolio
- `updatePortfolioItem()` - Update item details
- `getPortfolioItems()` - Fetch all portfolio items
- `reorderPortfolioItems()` - Change display order

### 4. **Updated Creator Profile** (`app/[locale]/(routes)/creator/[uid]/client-page.tsx`)
- Fetches and displays portfolio items
- Shows portfolio section if items exist
- Maintains existing Instagram "coming soon" section as fallback

### 5. **Portfolio Manager Component** (`app/components/creator/PortfolioManager.tsx`)
Full-featured upload and management UI for creators (for their own dashboard).

## How to Add Portfolio Items to a Creator

### Method 1: Via Firebase Console (Quick Test)

1. Open Firebase Console → Firestore Database
2. Navigate to `users` → `{creatorId}`
3. Add a new field called `portfolio` (type: array)
4. Add objects with this structure:
```json
{
  "id": "portfolio_001",
  "type": "image",
  "url": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800",
  "title": "Mountain Adventure",
  "description": "Content collaboration",
  "uploadedAt": "2025-10-27T10:00:00.000Z",
  "order": 0
}
```

### Method 2: Sample Data Script

Use the sample portfolio data I created:

```javascript
// In scripts/add-sample-portfolio.js
const { samplePortfolioItems } = require('./scripts/add-sample-portfolio');

// Add to Firebase manually or via admin SDK
```

### Method 3: Using the Portfolio Manager Component

Add `PortfolioManager` to the creator's dashboard where they manage their own profile:

```tsx
import PortfolioManager from '@/app/components/creator/PortfolioManager';

// In creator dashboard
<PortfolioManager 
  portfolio={creatorPortfolio} 
  onUpdate={refreshPortfolio} 
/>
```

## Testing the Portfolio

1. **Add sample data** to a creator profile in Firebase
2. **Navigate** to the creator profile page: `/creator/{uid}`
3. **Scroll down** past the calendar section
4. **See the masonry grid** displaying portfolio items
5. **Click any item** to open the lightbox modal

## Sample Portfolio Data (For Testing)

Here are some free Unsplash images you can use for testing:

```javascript
const sampleItems = [
  {
    id: 'portfolio_001',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
    title: 'Mountain Adventure',
    description: 'Swiss Alps campaign',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'portfolio_002',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3',
    title: 'Luxury Resort',
    description: 'Beach resort content',
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'portfolio_003',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
    title: 'City Exploration',
    description: 'Urban travel vlog',
    uploadedAt: new Date().toISOString()
  }
];
```

## Features

✅ **Pinterest-style masonry layout** - Irregular tile sizes  
✅ **Responsive design** - Works on all screen sizes  
✅ **Image & video support** - Both media types supported  
✅ **Lightbox modal** - Full-screen viewing experience  
✅ **Video playback** - Auto-play in lightbox with controls  
✅ **Smooth animations** - Hover effects and transitions  
✅ **Firebase integration** - Complete CRUD operations  
✅ **Upload management** - Full UI for creators to manage their portfolio  

## Next Steps

To test the portfolio display:

1. Add the sample data to your creator profile in Firebase Console
2. Visit: `http://localhost:3001/creator/UJ7NJTUTwWPcLbPGOXzDAoORRmj1`
3. You should see the portfolio masonry grid below the calendar

To enable creators to upload their own portfolio items:

1. Add `PortfolioManager` component to creator dashboard
2. Give creators permission to upload to their Firebase Storage path
3. Configure Firebase Storage rules appropriately

## Firebase Storage Rules

Make sure your Firebase Storage rules allow creators to upload to their own portfolio folder:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /portfolioItems/{userId}/{allPaths=**} {
      allow read: if true;  // Public read
      allow write: if request.auth != null && request.auth.uid == userId;  // Only creator can write
    }
  }
}
```

## Firestore Security Rules

Update Firestore rules to allow creators to manage their portfolio:

```javascript
match /users/{userId} {
  allow read: if true;
  allow update: if request.auth != null && request.auth.uid == userId
                && request.resource.data.keys().hasOnly(['portfolio']);
}
```

