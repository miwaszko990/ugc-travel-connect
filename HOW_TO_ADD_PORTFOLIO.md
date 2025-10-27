# How Creators Can Add Images and Videos to Portfolio

## ✅ Setup Complete!

I've added a new **Portfolio** tab to the creator dashboard where creators can upload and manage their images and videos.

## 📍 Where to Find It

1. **Login as a Creator**
2. **Go to Creator Dashboard**: `http://localhost:3001/dashboard/creator`
3. **Click the "Portfolio" tab** (fourth tab)

### Navigation Options:

**Desktop:**
- Top navigation bar → "Portfolio" tab (with camera icon 📷)

**Mobile:**
- Bottom navigation bar → "Portfolio" button

## 📤 How to Upload Portfolio Items

### Step-by-Step:

1. **Navigate to Portfolio tab** in creator dashboard
2. **Click "Dodaj element"** (Add Item) button
3. **Select a file:**
   - Click "Choose file" to select image or video
   - Supports: JPG, PNG, GIF, MP4, MOV, etc.
4. **Add details (optional):**
   - **Title**: Name of the project/campaign
   - **Description**: Short description
5. **Click "Dodaj do portfolio"** (Add to Portfolio)
6. **Wait for upload** - progress bar will show status
7. **Done!** - Item appears in masonry grid

## 🎨 Features

### Upload Interface:
- ✅ Drag & drop file selector
- ✅ Image & video preview before upload
- ✅ Progress bar during upload
- ✅ Title & description fields (optional)
- ✅ Responsive modal design

### Portfolio Display:
- ✅ Pinterest-style masonry grid
- ✅ Irregular tile heights (authentic Pinterest look)
- ✅ Hover effects
- ✅ Click to open full-screen lightbox
- ✅ Video playback in lightbox with controls
- ✅ Responsive: 1 column (mobile) → 3 columns (desktop)

### Management:
- ✅ View all portfolio items
- ✅ Delete items (hover to see delete button)
- ✅ Auto-saves to Firebase
- ✅ Immediate updates

## 🔒 Security

- Only creators can upload to their own portfolio
- Files stored in Firebase Storage under `portfolioItems/{userId}/`
- Portfolio items visible to everyone on creator profile pages

## 👀 Where Portfolio Appears

### 1. Creator Dashboard (Management)
`/dashboard/creator?tab=portfolio`
- Full upload and management interface
- Only visible to the creator themselves

### 2. Public Creator Profile (Display)
`/creator/{creatorId}`
- Beautiful masonry display
- Visible to everyone (brands, other creators, public)
- Below the travel calendar section

## 📊 Data Structure

Portfolio items are stored in Firestore under:
```
users/{creatorId}/
  └─ portfolio: [
       {
         id: "portfolio_123",
         type: "image" or "video",
         url: "https://firebase...",
         thumbnailUrl: "...", // For videos
         title: "Project Name",
         description: "Description",
         uploadedAt: "2025-10-27T...",
         order: 0
       }
     ]
```

## 🧪 Test It Now

1. **Login as creator**: `http://localhost:3001/auth/login`
2. **Go to dashboard**: Click "Dashboard" or navigate to `/dashboard/creator`
3. **Click "Portfolio" tab**
4. **Click "Dodaj element"** to upload your first item!

## 🎯 Example Use Cases

### For Travel Creators:
- 📸 Best travel photos from campaigns
- 🎥 UGC video content samples
- 🌍 Destination highlight reels
- ✈️ Brand collaboration examples

### What Creators Can Upload:
- Professional campaign photos
- UGC video content
- Instagram reel exports
- YouTube video links (as video files)
- Behind-the-scenes content
- Product photography
- Travel vlogs

## 💡 Tips for Creators

1. **Add titles** to help brands understand the context
2. **Mix images and videos** for variety
3. **Show different styles** of content creation
4. **Include brand work** you're proud of
5. **Update regularly** to keep profile fresh

## 🔧 Technical Details

**Supported File Types:**
- Images: JPG, JPEG, PNG, GIF, WebP
- Videos: MP4, MOV, WebM, OGG

**File Size Limits:**
- Images: Up to 10MB recommended
- Videos: Up to 100MB recommended

**Storage:**
- Firebase Storage
- Automatic URL generation
- CDN-delivered for fast loading

**Performance:**
- Optimized image loading
- Lazy loading for large portfolios
- Responsive image sizes

