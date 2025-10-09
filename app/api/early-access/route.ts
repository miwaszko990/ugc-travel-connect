import { NextResponse } from "next/server";
import { db } from '@/app/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();
    
    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
    }

    const payload = {
      email: email.toLowerCase().trim(),
      source: source ?? "unknown",
      createdAt: serverTimestamp(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Save to Firebase
      const earlyAccessRef = collection(db, 'early_access_waitlist');
      await addDoc(earlyAccessRef, payload);
      
      console.log('[early-access] Saved to Firebase:', { email: payload.email, source: payload.source });
      
      return NextResponse.json({ ok: true });
    } catch (firebaseError) {
      // Fallback to console log if Firebase fails
      console.log("[early-access-fallback]", payload);
      console.error("[early-access] Firebase error:", firebaseError);
      
      return NextResponse.json({ ok: true }); // Still return success to user
    }
  } catch (error) {
    console.error("[early-access] Error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}




