'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/hooks/useAuth';

interface InstagramMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  permalink: string;
  caption: string;
  timestamp: string;
}

interface InstagramPost {
  id: string;
  url: string;
  postId: string;
}

interface InstagramFeedHybridProps {
  creatorId: string;
  instagramHandle?: string;
}

const InstagramFeedHybrid: React.FC<InstagramFeedHybridProps> = ({ 
  creatorId, 
  instagramHandle 
}) => {
  const [autoMedia, setAutoMedia] = useState<InstagramMedia[]>([]);
  const [manualPosts, setManualPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBusinessConnected, setIsBusinessConnected] = useState(false);
  const [newPostUrl, setNewPostUrl] = useState('');
  const { user } = useAuth();
  const isOwner = user?.uid === creatorId;

  useEffect(() => {
    loadInstagramContent();
  }, [creatorId]);

  const loadInstagramContent = async () => {
    try {
      setLoading(true);
      
      // Try to load automatic business account media first
      const autoResponse = await fetch(`/api/instagram/media?userId=${creatorId}`);
      
      if (autoResponse.ok) {
        const autoData = await autoResponse.json();
        setAutoMedia(autoData.media || []);
        setIsBusinessConnected(true);
      } else {
        setIsBusinessConnected(false);
        setAutoMedia([]);
      }

      // Always load manual posts as fallback/supplement
      const manualResponse = await fetch(`/api/instagram/posts?creatorId=${creatorId}`);
      if (manualResponse.ok) {
        const manualData = await manualResponse.json();
        setManualPosts(manualData.posts || []);
      }

    } catch (err) {
      console.error('Error loading Instagram content:', err);
      setError('Failed to load Instagram content');
    } finally {
      setLoading(false);
    }
  };

  const connectBusinessAccount = () => {
    const authUrl = generateInstagramAuthUrl(creatorId);
    window.open(authUrl, '_blank', 'width=500,height=600');
  };

  const generateInstagramAuthUrl = (userId: string) => {
    const baseUrl = 'https://api.instagram.com/oauth/authorize';
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || '',
      redirect_uri: `${window.location.origin}/api/auth/instagram/callback`,
      scope: 'user_profile,user_media',
      response_type: 'code',
      state: userId,
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  const extractPostId = (url: string): string | null => {
    const patterns = [
      /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
      /instagr\.am\/p\/([A-Za-z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const addManualPost = async () => {
    if (!newPostUrl.trim()) return;
    
    const postId = extractPostId(newPostUrl);
    if (!postId) {
      alert('Please enter a valid Instagram post URL');
      return;
    }

    try {
      const response = await fetch('/api/instagram/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          postUrl: newPostUrl.trim(),
          postId
        })
      });

      if (response.ok) {
        setNewPostUrl('');
        loadInstagramContent();
      } else {
        alert('Failed to add Instagram post');
      }
    } catch (err) {
      console.error('Error adding post:', err);
      alert('Failed to add Instagram post');
    }
  };

  const removeManualPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/instagram/posts?postId=${postId}&creatorId=${creatorId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadInstagramContent();
      }
    } catch (err) {
      console.error('Error removing post:', err);
    }
  };

  if (loading) {
    return (
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Latest from Instagram</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      </section>
    );
  }

  const totalPosts = autoMedia.length + manualPosts.length;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Latest from Instagram
          {instagramHandle && (
            <a 
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-lg text-gray-500 hover:text-red-500"
            >
              @{instagramHandle}
            </a>
          )}
        </h2>
        
        {isBusinessConnected && isOwner && (
          <button
            onClick={loadInstagramContent}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Feed
          </button>
        )}
      </div>

      {/* Connection Status for Owners */}
      {isOwner && (
        <div className="mb-8">
          {/* Business Account Connection */}
          {!isBusinessConnected && (
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-4 rounded-xl mb-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-purple-600" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                  </svg>
                  <h3 className="font-semibold text-gray-900">🚀 Pro Mode: Connect Business Account</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Automatic sync:</strong> Connect your Instagram Business account for automatic feed updates, analytics, and more professional features.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={connectBusinessAccount}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Connect Business Account
                  </button>
                  <a 
                    href="https://help.instagram.com/502981923235522" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                  >
                    How to Convert (Free)
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Manual Post Addition */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">
              {isBusinessConnected ? '📝 Add Additional Posts' : '📱 Add Instagram Posts'}
            </h3>
            <div className="flex gap-2">
              <input
                type="url"
                value={newPostUrl}
                onChange={(e) => setNewPostUrl(e.target.value)}
                placeholder="Paste Instagram post URL (e.g., https://instagram.com/p/ABC123)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={addManualPost}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Add Post
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {isBusinessConnected 
                ? 'Supplement your automatic feed with additional posts'
                : 'Copy URLs from your Instagram posts to showcase them here'
              }
            </p>
          </div>
        </div>
      )}

      {/* Instagram Posts Grid */}
      {totalPosts > 0 ? (
        <div className="space-y-8">
          {/* Automatic Business Posts */}
          {autoMedia.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                  🚀 Auto-synced
                </span>
                <span className="text-sm text-gray-500">from Business Account</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {autoMedia.map((item) => (
                  <div key={item.id} className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                    <a 
                      href={item.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={item.thumbnail}
                          alt={item.caption ? item.caption.substring(0, 100) : 'Instagram post'}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {item.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/50 rounded-full p-3">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      {item.caption && (
                        <div className="p-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.caption}
                          </p>
                        </div>
                      )}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual Posts */}
          {manualPosts.length > 0 && (
            <div>
              {autoMedia.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    📱 Manual
                  </span>
                  <span className="text-sm text-gray-500">curated posts</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {manualPosts.map((post) => (
                  <div key={post.id} className="relative">
                    <iframe
                      src={`https://www.instagram.com/p/${post.postId}/embed/`}
                      width="100%"
                      height="500"
                      frameBorder="0"
                      scrolling="no"
                      allowTransparency
                      className="rounded-lg"
                    />
                    {isOwner && (
                      <button
                        onClick={() => removeManualPost(post.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Instagram posts yet</h3>
          <p className="text-gray-500">
            {isOwner 
              ? 'Connect your Instagram Business account for automatic sync, or add posts manually above.'
              : 'This creator hasn\'t added any Instagram posts yet.'
            }
          </p>
        </div>
      )}
    </section>
  );
};

export default InstagramFeedHybrid; 