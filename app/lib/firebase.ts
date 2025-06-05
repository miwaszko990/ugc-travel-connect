import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Log Firebase config (without sensitive values)
console.log('Firebase config:', {
  apiKey: firebaseConfig.apiKey ? '✓' : '✗',
  authDomain: firebaseConfig.authDomain ? '✓' : '✗',
  projectId: firebaseConfig.projectId ? '✓' : '✗',
  storageBucket: firebaseConfig.storageBucket ? '✓' : '✗',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✓' : '✗',
  appId: firebaseConfig.appId ? '✓' : '✗',
  databaseURL: firebaseConfig.databaseURL ? '✓' : '✗'
});

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with the workaround for WebChannel connection issues
const db = getFirestore(app, "default");
const storage = getStorage(app);
const database = getDatabase(app);
const functions = getFunctions(app);

// Only log critical connection events in production
if (process.env.NODE_ENV === 'development') {
  // More verbose logging in development
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => console.log('Network restored'));
    window.addEventListener('offline', () => console.log('Network lost - using cache'));
  }
      } else {
  // Only log serious errors in production
  if (typeof window !== 'undefined') {
    window.addEventListener('offline', () => console.warn('Network connection lost'));
      }
}

// Add only if you need the emulator
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  const { connectFirestoreEmulator } = require('firebase/firestore');
  connectFirestoreEmulator(db, 'localhost', 8080);
  
  // Add Database emulator if needed
  const { connectDatabaseEmulator } = require('firebase/database');
  connectDatabaseEmulator(database, 'localhost', 9000);
}

export { app, auth, db, storage, database, functions }; 