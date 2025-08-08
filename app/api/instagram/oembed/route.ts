import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Validate Instagram URL
    if (!url.includes('instagram.com')) {
      return NextResponse.json({ error: 'Invalid Instagram URL' }, { status: 400 });
    }

    // Fetch Instagram oEmbed data
    const oembedUrl = `https://graph.instagram.com/instagram_oembed?url=${encodeURIComponent(url)}&omitscript=true`;
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InstagramBot/1.0)',
      },
    });

    if (!response.ok) {
      console.error('Instagram oEmbed API error:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: response.status });
    }

    const data = await response.json();
    
    // Extract image URL from the oEmbed response
    let imageUrl = null;
    let thumbnailUrl = null;

    // Try to get thumbnail_url directly
    if (data.thumbnail_url) {
      thumbnailUrl = data.thumbnail_url;
      imageUrl = data.thumbnail_url;
    }

    // If no thumbnail_url, try to extract from HTML
    if (!imageUrl && data.html) {
      const imgMatch = data.html.match(/src="([^"]*\.jpg[^"]*)"/);
      if (imgMatch) {
        imageUrl = imgMatch[1];
        thumbnailUrl = imgMatch[1];
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      thumbnailUrl,
      title: data.title || '',
      author_name: data.author_name || '',
      provider_name: data.provider_name || 'Instagram'
    });

  } catch (error) {
    console.error('Error fetching Instagram oEmbed:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch Instagram data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 