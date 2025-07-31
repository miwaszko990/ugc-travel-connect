'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

interface InstagramPost {
  id: string;
  url: string;
  postId: string;
  type: 'post' | 'reel';
  createdAt: string;
}

interface InstagramFeedManualProps {
  creatorId: string;
  instagramHandle?: string;
}

const InstagramFeedManual: React.FC<InstagramFeedManualProps> = ({ 
  creatorId, 
  instagramHandle 
}) => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingPost, setAddingPost] = useState(false);
  const [newPostUrl, setNewPostUrl] = useState('');
  const { user } = useAuth();
  const isOwner = user?.uid === creatorId;

  useEffect(() => {
    loadInstagramPosts();
  }, [creatorId]);

  const loadInstagramPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instagram/posts?creatorId=${creatorId}`);
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Error loading Instagram posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const extractPostId = (url: string): { postId: string; type: 'post' | 'reel' } | null => {
    const postPattern = /instagram\.com\/p\/([A-Za-z0-9_-]+)/;
    const reelPattern = /instagram\.com\/reel\/([A-Za-z0-9_-]+)/;
    
    const postMatch = url.match(postPattern);
    if (postMatch) return { postId: postMatch[1], type: 'post' };
    
    const reelMatch = url.match(reelPattern);
    if (reelMatch) return { postId: reelMatch[1], type: 'reel' };
    
    return null;
  };

  const addInstagramPost = async () => {
    if (!newPostUrl.trim()) return;
    
    const extracted = extractPostId(newPostUrl);
    if (!extracted) {
      alert('Please enter a valid Instagram post or reel URL\n\nExample:\nhttps://instagram.com/p/ABC123\nhttps://instagram.com/reel/DEF456');
      return;
    }

    setAddingPost(true);
    try {
      const response = await fetch('/api/instagram/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          postUrl: newPostUrl.trim(),
          postId: extracted.postId,
          type: extracted.type
        })
      });

      if (response.ok) {
        setNewPostUrl('');
        loadInstagramPosts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add Instagram post');
      }
    } catch (err) {
      console.error('Error adding post:', err);
      alert('Failed to add Instagram post');
    } finally {
      setAddingPost(false);
    }
  };

  const removePost = async (postId: string) => {
    if (!confirm('Remove this Instagram post?')) return;
    
    try {
      const response = await fetch(`/api/instagram/posts?postId=${postId}&creatorId=${creatorId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadInstagramPosts();
      } else {
        alert('Failed to remove post');
      }
    } catch (err) {
      console.error('Error removing post:', err);
      alert('Failed to remove post');
    }
  };

  if (loading) {
    return (
      <section className="mt-12">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Latest from Instagram
            </h2>
            {instagramHandle && (
              <a 
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-pink-500 transition-colors"
              >
                @{instagramHandle}
              </a>
            )}
          </div>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      {/* Instagram Header */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
              <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Latest from Instagram
          </h2>
          {instagramHandle && (
            <a 
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-pink-500 transition-colors font-medium"
            >
              @{instagramHandle}
            </a>
          )}
        </div>
      </div>

      {/* Add Post Form (Owner Only) */}
      {isOwner && (
        <div className="mb-8 mx-auto max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-2 rounded-full">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Add Instagram Post</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <input
                  type="url"
                  value={newPostUrl}
                  onChange={(e) => setNewPostUrl(e.target.value)}
                  placeholder="Paste Instagram post or reel URL..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  disabled={addingPost}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <div className="mb-1">📱 <strong>Supported:</strong> Posts & Reels</div>
                  <div className="text-xs">
                    <strong>Example:</strong> https://instagram.com/p/ABC123...
                  </div>
                </div>
                
                <button
                  onClick={addInstagramPost}
                  disabled={addingPost || !newPostUrl.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingPost ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {posts.map((post) => (
            <div key={post.id} className="relative group">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <iframe
                  src={`https://www.instagram.com/p/${post.postId}/embed/captioned`}
                  width="100%"
                  height="500"
                  frameBorder="0"
                  scrolling="no"
                  allowTransparency
                  className="w-full"
                  loading="lazy"
                />
              </div>
              
              {/* Remove button for owner */}
              {isOwner && (
                <button
                  onClick={() => removePost(post.id)}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Remove post"
                >
                  ×
                </button>
              )}
              
              {/* Post type indicator */}
              {post.type === 'reel' && (
                <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Reel
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="mx-auto max-w-md">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-1 rounded-3xl mb-6 inline-block">
              <div className="bg-white rounded-2xl p-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="text-gray-300 mx-auto mb-4" viewBox="0 0 16 16">
                  <path d="M4.502 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM4 10.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0z"/>
                  <path d="M14 2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM2 3h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Instagram posts yet</h3>
                <p className="text-gray-600 mb-4">
                  {isOwner 
                    ? 'Showcase your best content by adding Instagram posts and reels'
                    : 'This creator hasn\'t added any Instagram content yet'
                  }
                </p>
                {isOwner && (
                  <div className="text-sm text-gray-500">
                    <div className="mb-2">✨ <strong>Easy to add:</strong></div>
                    <div className="text-xs">
                      1. Open Instagram → Find your post<br/>
                      2. Tap share → Copy link<br/>
                      3. Paste above → Click "Add Post"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default InstagramFeedManual; 