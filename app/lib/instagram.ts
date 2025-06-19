interface InstagramUser {
  id: string;
  username: string;
  followers_count: number;
  media_count: number;
  account_type: 'PERSONAL' | 'BUSINESS' | 'CREATOR';
}

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
}

export class InstagramAPI {
  private baseUrl = 'https://graph.instagram.com';
  
  constructor(private accessToken: string) {}

  // Get user profile info
  async getUserProfile(): Promise<InstagramUser> {
    const fields = 'id,username,followers_count,media_count,account_type';
    const response = await fetch(
      `${this.baseUrl}/me?fields=${fields}&access_token=${this.accessToken}`
    );
    
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get user's recent media
  async getUserMedia(limit = 12): Promise<InstagramMedia[]> {
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
    const response = await fetch(
      `${this.baseUrl}/me/media?fields=${fields}&limit=${limit}&access_token=${this.accessToken}`
    );
    
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  }

  // Exchange short-lived token for long-lived token
  static async exchangeToken(shortLivedToken: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const response = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${shortLivedToken}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Refresh long-lived token
  static async refreshToken(accessToken: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// OAuth URL generator
export function getInstagramAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    scope: 'user_profile,user_media',
    response_type: 'code',
  });
  
  return `https://api.instagram.com/oauth/authorize?${params}`;
} 