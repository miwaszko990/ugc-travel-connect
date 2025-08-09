'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/auth';

interface InstagramPost {
  id: string;
  url: string;
  embedHtml?: string;
}

interface InstagramFeedSimpleProps {
  creatorId: string;
  instagramHandle?: string;
}

const InstagramFeedSimple: React.FC<InstagramFeedSimpleProps> = ({ 
  creatorId, 
  instagramHandle 
}) => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // For MVP: Allow creators to manually add their Instagram post URLs
  const [newPostUrl, setNewPostUrl] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    setIsOwner(user?.uid === creatorId);
    loadInstagramPosts();
  }, [creatorId, user]);

  const loadInstagramPosts = async () => {
    try {
      setLoading(true);
      // For now, we'll fetch from Firebase where creators manually add their posts
      const response = await fetch(`/api/instagram/posts?creatorId=${creatorId}`);
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        // If no posts found, show empty state
        setPosts([]);
      }
    } catch (err) {
      console.error('Error loading Instagram posts:', err);
      setError('Failed to load Instagram posts');
    } finally {
      setLoading(false);
    }
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

  const addInstagramPost = async () => {
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
        loadInstagramPosts(); // Reload posts
      } else {
        alert('Failed to add Instagram post');
      }
    } catch (err) {
      console.error('Error adding post:', err);
      alert('Failed to add Instagram post');
    }
  };

  const removePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/instagram/posts?postId=${postId}&creatorId=${creatorId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadInstagramPosts(); // Reload posts
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
      </div>

      {/* Add Post Form (only for creator) */}
      {isOwner && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Add Instagram Post</h3>
          <div className="flex gap-2">
            <input
              type="url"
              value={newPostUrl}
              onChange={(e) => setNewPostUrl(e.target.value)}
              placeholder="Paste Instagram post URL (e.g., https://instagram.com/p/ABC123)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={addInstagramPost}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Add Post
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Copy the URL from any Instagram post or reel you want to showcase
          </p>
        </div>
      )}

      {/* Instagram Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="relative">
              <iframe
                src={`https://www.instagram.com/p/${extractPostId(post.url)}/embed/`}
                width="100%"
                height="500"
                frameBorder="0"
                scrolling="no"
                allowTransparency
                className="rounded-lg"
              />
              {isOwner && (
                <button
                  onClick={() => removePost(post.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Instagram posts yet</h3>
          <p className="text-gray-500">
            {isOwner 
              ? 'Add your Instagram posts to showcase your content to potential collaborators'
              : 'This creator hasn\'t added any Instagram posts yet'
            }
          </p>
        </div>
      )}
    </section>
  );
};

export default InstagramFeedSimple; 