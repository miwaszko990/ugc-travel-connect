import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, source, timestamp } = body;

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Save to Firebase
    const quickSignupsRef = collection(db, 'quickSignups');
    const docRef = await addDoc(quickSignupsRef, {
      email: email.toLowerCase().trim(),
      role,
      source: source || 'unknown',
      timestamp: timestamp || new Date().toISOString(),
      createdAt: serverTimestamp(),
      processed: false,
    });

    console.log('Quick signup saved:', { id: docRef.id, email, role, source });

    // TODO: Add webhook call here if needed
    // await fetch('YOUR_WEBHOOK_URL', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, role, source, timestamp })
    // });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Quick signup saved successfully',
        id: docRef.id 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Quick signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}







