import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/app/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/instagram/callback';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state'); // This should contain the user ID

    if (error) {
      console.error('Instagram OAuth error:', error);
      return NextResponse.redirect(new URL('/creator/profile/settings?error=instagram_auth_failed', request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/creator/profile/settings?error=missing_code', request.url));
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_APP_ID!,
        client_secret: INSTAGRAM_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/creator/profile/settings?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const { access_token, user_id } = tokenData;

    // Get long-lived access token
    const longLivedResponse = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${access_token}`);
    
    if (!longLivedResponse.ok) {
      console.error('Long-lived token exchange failed');
      return NextResponse.redirect(new URL('/creator/profile/settings?error=long_lived_token_failed', request.url));
    }

    const longLivedData = await longLivedResponse.json();
    const { access_token: longLivedToken, expires_in } = longLivedData;

    // Calculate expiry date (expires_in is in seconds)
    const expiryDate = new Date(Date.now() + (expires_in * 1000));

    // Update user document in Firestore
    const userRef = doc(db, 'users', state); // state contains the user ID
    await updateDoc(userRef, {
      instagramConnected: true,
      instagramAccessToken: longLivedToken,
      instagramUserId: user_id,
      instagramTokenExpiry: expiryDate,
      instagramLastSync: new Date(),
      updatedAt: new Date()
    });

    // Redirect back to profile settings with success
    return NextResponse.redirect(new URL('/creator/profile/settings?success=instagram_connected', request.url));

  } catch (error) {
    console.error('Instagram OAuth callback error:', error);
    return NextResponse.redirect(new URL('/creator/profile/settings?error=callback_error', request.url));
  }
} 