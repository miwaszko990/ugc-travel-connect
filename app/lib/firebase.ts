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

// Validate critical config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const error = new Error('Missing critical Firebase environment variables. Check your .env.local file.');
  
  // Log error details for debugging (safe for production)
  if (process.env.NODE_ENV === 'development') {
    console.error('Firebase Config Error:', {
      apiKeyExists: !!firebaseConfig.apiKey,
      projectIdExists: !!firebaseConfig.projectId,
      envVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_FIREBASE'))
    });
  }
  
  throw error;
}

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
    const handleOnline = () => console.log('Network restored');
    const handleOffline = () => console.log('Network lost - using cache');
    
    // Safely add event listeners
    try {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    } catch (e) {
      console.warn('Could not add network event listeners:', e);
    }
    
    // Cleanup function (should be called when component unmounts)
    const cleanup = () => {
      try {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      } catch (e) {
        console.warn('Could not remove network event listeners:', e);
      }
    };
    
    // Store cleanup function for potential use
    (window as any).__firebaseCleanup = cleanup;
  }
} else {
  // Only log serious errors in production
  if (typeof window !== 'undefined') {
    const handleOffline = () => console.warn('Network connection lost');
    try {
      window.addEventListener('offline', handleOffline);
      
      // Store cleanup for production too
      (window as any).__firebaseCleanup = () => {
        try {
          window.removeEventListener('offline', handleOffline);
        } catch (e) {
          console.warn('Could not remove offline listener:', e);
        }
      };
    } catch (e) {
      console.warn('Could not add offline listener:', e);
    }
  }
}

// Emulator connection disabled for production deployment

export { app, auth, db, storage, database, functions }; // review trigger
