import { NextRequest, NextResponse } from 'next/server';
import { InstagramAPI } from '@/app/lib/instagram';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/creator/profile-setup?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/creator/profile-setup?error=missing_code', request.url)
    );
  }

  try {
    // Exchange authorization code for short-lived access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID!,
        client_secret: process.env.INSTAGRAM_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const { access_token: shortLivedToken } = await tokenResponse.json();

    // Exchange short-lived token for long-lived token
    const longLivedTokenData = await InstagramAPI.exchangeToken(shortLivedToken);

    // Get user profile data
    const instagram = new InstagramAPI(longLivedTokenData.access_token);
    const profile = await instagram.getUserProfile();

    // Store in your database (you'll need to implement this)
    // await updateCreatorInstagramData(userId, {
    //   instagramId: profile.id,
    //   instagramUsername: profile.username,
    //   accessToken: longLivedTokenData.access_token,
    //   tokenExpiresAt: new Date(Date.now() + longLivedTokenData.expires_in * 1000),
    //   followersCount: profile.followers_count,
    // });

    return NextResponse.redirect(
      new URL('/dashboard/creator/profile-setup?instagram=connected', request.url)
    );
  } catch (error) {
    console.error('Instagram auth error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/creator/profile-setup?error=auth_failed', request.url)
    );
  }
} 