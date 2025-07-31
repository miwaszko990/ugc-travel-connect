import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/app/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user document from Firestore
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    if (!userData.instagramConnected || !userData.instagramAccessToken) {
      return NextResponse.json({ error: 'Instagram not connected' }, { status: 400 });
    }

    // Check if token is expired
    const tokenExpiry = userData.instagramTokenExpiry?.toDate();
    if (tokenExpiry && tokenExpiry < new Date()) {
      return NextResponse.json({ error: 'Instagram token expired' }, { status: 401 });
    }

    // Fetch Instagram media
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp&access_token=${userData.instagramAccessToken}&limit=12`
    );

    if (!mediaResponse.ok) {
      const errorData = await mediaResponse.json();
      console.error('Instagram API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch Instagram media' }, { status: 500 });
    }

    const mediaData = await mediaResponse.json();

    // Filter for images and videos only, format the response
    const formattedMedia = mediaData.data
      .filter((item: any) => item.media_type === 'IMAGE' || item.media_type === 'VIDEO')
      .map((item: any) => ({
        id: item.id,
        type: item.media_type.toLowerCase(),
        url: item.media_url,
        thumbnail: item.thumbnail_url || item.media_url,
        permalink: item.permalink,
        caption: item.caption || '',
        timestamp: item.timestamp
      }));

    // Update last sync time
    await updateDoc(userRef, {
      instagramLastSync: new Date()
    });

    return NextResponse.json({
      success: true,
      media: formattedMedia,
      total: formattedMedia.length
    });

  } catch (error) {
    console.error('Instagram media fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 