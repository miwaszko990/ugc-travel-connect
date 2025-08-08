import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { collection, doc, getDocs, addDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID required' }, { status: 400 });
    }

    // Get Instagram posts for this creator from Firestore
    const postsRef = collection(db, 'instagramPosts');
    const q = query(
      postsRef, 
      where('creatorId', '==', creatorId)
    );
    
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by createdAt in JavaScript instead of Firebase query
    const sortedPosts = posts.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return bTime.getTime() - aTime.getTime(); // Newest first
    });

    return NextResponse.json({
      success: true,
      posts: sortedPosts
    });

  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { creatorId, postUrl, postId, type } = await request.json();
    
    console.log('Instagram POST API called with:', { creatorId, postUrl, postId, type });

    if (!creatorId || !postUrl || !postId) {
      console.error('Missing required fields:', { creatorId, postUrl, postId });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate Instagram URL format
    const instagramPattern = /(instagram\.com|instagr\.am)\/(p|reel)\/([A-Za-z0-9_-]+)/;
    if (!instagramPattern.test(postUrl)) {
      return NextResponse.json({ error: 'Invalid Instagram URL format' }, { status: 400 });
    }

    // Check if post already exists
    const postsRef = collection(db, 'instagramPosts');
    const existingQuery = query(
      postsRef,
      where('creatorId', '==', creatorId),
      where('postId', '==', postId)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      return NextResponse.json({ error: 'Post already added' }, { status: 400 });
    }

    // Add new Instagram post to Firestore
    const newPost = {
      creatorId,
      postUrl,
      postId,
      type: type || 'post', // Default to 'post' if not specified
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(postsRef, newPost);
    
    console.log('Instagram post saved successfully:', docRef.id);

    return NextResponse.json({
      success: true,
      post: {
        id: docRef.id,
        ...newPost
      }
    });

  } catch (error) {
    console.error('Error adding Instagram post:', error);
    return NextResponse.json({ error: 'Failed to add post', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const creatorId = searchParams.get('creatorId');

    if (!postId || !creatorId) {
      return NextResponse.json({ error: 'Post ID and Creator ID required' }, { status: 400 });
    }

    // Verify the post belongs to this creator before deleting
    const postRef = doc(db, 'instagramPosts', postId);
    await deleteDoc(postRef);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting Instagram post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
} 