/**
 * Script to generate thumbnails for existing portfolio videos
 * Run this once to add thumbnails to videos uploaded before thumbnail feature
 */

const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { createCanvas, Image } = require('canvas');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'ugc-travel-connect.appspot.com'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function generateThumbnailFromVideo(videoBuffer) {
  // This is a placeholder - generating thumbnails from video in Node.js
  // requires ffmpeg or a similar library
  console.log('Note: Server-side video thumbnail generation requires ffmpeg');
  console.log('Consider using a client-side approach or cloud function instead');
  return null;
}

async function processUserPortfolio(userId, portfolio) {
  let updated = false;
  
  for (const item of portfolio) {
    // Skip if not a video or already has thumbnail
    if (item.type !== 'video' || item.thumbnailUrl) {
      continue;
    }

    console.log(`Processing video: ${item.id}`);
    
    try {
      // For now, we'll create a placeholder thumbnail
      // In production, you'd want to use ffmpeg or a cloud function
      console.log(`  Video URL: ${item.url}`);
      console.log(`  ⚠️  Thumbnail generation requires manual processing or ffmpeg`);
      
      // TODO: Implement actual thumbnail generation
      // This would require downloading the video and extracting a frame
      
    } catch (error) {
      console.error(`  ❌ Error processing ${item.id}:`, error.message);
    }
  }
  
  return updated;
}

async function main() {
  console.log('🎬 Starting video thumbnail generation...\n');
  
  try {
    // Get all users with portfolios
    const usersSnapshot = await db.collection('users').get();
    let totalUsers = 0;
    let totalVideos = 0;
    let processedVideos = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      if (!userData.portfolio || userData.portfolio.length === 0) {
        continue;
      }

      // Check if user has videos without thumbnails
      const videosWithoutThumbnails = userData.portfolio.filter(
        item => item.type === 'video' && !item.thumbnailUrl
      );

      if (videosWithoutThumbnails.length === 0) {
        continue;
      }

      totalUsers++;
      totalVideos += videosWithoutThumbnails.length;

      console.log(`\n👤 User: ${userData.firstName} ${userData.lastName} (${userDoc.id})`);
      console.log(`   Videos without thumbnails: ${videosWithoutThumbnails.length}`);

      const updated = await processUserPortfolio(userDoc.id, userData.portfolio);
      
      if (updated) {
        processedVideos += videosWithoutThumbnails.length;
      }
    }

    console.log('\n✅ Migration complete!');
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Total videos: ${totalVideos}`);
    console.log(`   Processed: ${processedVideos}`);
    
    if (totalVideos > 0 && processedVideos === 0) {
      console.log('\n⚠️  Note: Automatic thumbnail generation requires additional setup.');
      console.log('   Options:');
      console.log('   1. Use client-side regeneration (recommended)');
      console.log('   2. Install ffmpeg and implement server-side generation');
      console.log('   3. Use a cloud function with video processing capabilities');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

main();

