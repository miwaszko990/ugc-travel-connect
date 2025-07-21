'use client';

import React, { createContext, useContext, ReactNode, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase';
import { toast } from 'react-hot-toast';
import { createUserDocument, getUserDocument } from '@/app/lib/firebase/utils';

// Define UserRole type
export type UserRole = 'creator' | 'brand';

// Define UserData interface
export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt?: any;
  updatedAt?: any;
  // Profile fields
  firstName?: string;
  lastName?: string;
  instagramHandle?: string;
  followerCount?: number;
  homeCity?: string;
  profileImageUrl?: string;
  profileComplete?: boolean;
  // Brand specific fields
  brandName?: string;
  website?: string;
  industry?: string;
  logoImageUrl?: string;
}

// Auth state type
type AuthState = {
  user: UserData | null;
  loading: boolean;
  error: string | null;
};

// Auth action types
type AuthAction = 
  | { type: 'AUTH_STATE_CHANGED'; payload: UserData | null }
  | { type: 'LOADING'; payload: boolean }
  | { type: 'ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null
};

// Auth reducer function
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_STATE_CHANGED':
      return {
        ...state,
        user: action.payload,
        loading: false
      };
    case 'LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
}

// Context type
interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Format Firebase error messages
const formatError = (error: any): string => {
  const errorCode = error.code;
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please login instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};

// Add error boundary
class AuthErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Auth Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h2 className="text-lg font-semibold">Authentication Error</h2>
          <p className="text-sm">Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap the AuthProvider with error boundary
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthErrorBoundary>
      <AuthProviderInner>{children}</AuthProviderInner>
    </AuthErrorBoundary>
  );
}

// Provider component
export function AuthProviderInner({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Clear error on route change
  useEffect(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [router]);

  // Sign up with email and password
  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      console.log('Starting signup process...', { email, role });
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('User created in Auth successfully:', { uid: user.uid, email: user.email });
      
      // Create user document in Firestore using utility function
      console.log('Attempting to create user document in Firestore...');
      try {
        // Wait for the createUserDocument to complete
        const userData = await createUserDocument(user.uid, email, role);
        console.log('User document created/processed:', userData);

        // Update state
        dispatch({ type: 'AUTH_STATE_CHANGED', payload: userData });
        
        // Show success message
        toast.success('Account created successfully!');
        
        // Force role to be properly processed
        const dashboardPath = role === 'creator' 
          ? '/dashboard/creator/profile-setup' 
          : '/dashboard/brand/profile-setup';
        console.log(`Redirecting to ${dashboardPath}`);
        
        router.push(dashboardPath);
      } catch (firestoreError) {
        console.error('Firestore error during signup:', firestoreError);
        
        // Even if Firestore fails, still proceed with basic user info
        const basicUserData: UserData = {
          uid: user.uid,
          email: user.email || '',
          role: role,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        dispatch({ type: 'AUTH_STATE_CHANGED', payload: basicUserData });
        toast.error('Created account with limited functionality...');
        
        // Still redirect
        const fallbackDashboardPath = role === 'creator' 
          ? '/dashboard/creator/profile-setup' 
          : '/dashboard/brand/profile-setup';
        router.push(fallbackDashboardPath);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      dispatch({ type: 'ERROR', payload: formatError(error) });
      dispatch({ type: 'LOADING', payload: false });
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore using utility function
      const userData = await getUserDocument(user.uid);
      
      if (userData) {
        dispatch({ type: 'AUTH_STATE_CHANGED', payload: userData });
        
        // Redirect directly to dashboard based on role, no profile check
        if (userData.role === 'creator') {
          router.push('/dashboard/creator');
        } else if (userData.role === 'brand') {
          router.push('/dashboard');
        }
      } else {
        // User exists in Auth but not in Firestore
        dispatch({ type: 'ERROR', payload: 'User account incomplete. Please contact support.' });
        dispatch({ type: 'LOADING', payload: false });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({ type: 'ERROR', payload: formatError(error) });
      dispatch({ type: 'LOADING', payload: false });
    }
  };

  // Sign out
  const logout = async () => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      await signOut(auth);
      dispatch({ type: 'AUTH_STATE_CHANGED', payload: null });
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      dispatch({ type: 'ERROR', payload: formatError(error) });
      dispatch({ type: 'LOADING', payload: false });
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔍 Auth state changed:', user ? `User ${user.uid}` : 'No user');
      
      if (user) {
        try {
          // Get user data from Firestore using utility function
          const userData = await getUserDocument(user.uid);
          
          if (userData) {
            // User document exists in Firestore
            console.log('User document found, updating state');
            dispatch({ type: 'AUTH_STATE_CHANGED', payload: userData });
            
            // Check if we're on a login or register page and redirect if needed
            const path = window.location.pathname;
            console.log('Current path during auth check:', path);
            
            if ((path === '/auth/login' || path === '/auth/register') && userData.role) {
              console.log('User already logged in, redirecting to dashboard');
              if (userData.role === 'creator') {
                router.push('/dashboard/creator');
              } else if (userData.role === 'brand') {
                router.push('/dashboard');
              }
            }
            
            // Check if user has completed their profile
            const hasCompletedProfile = userData.firstName && userData.lastName;
            console.log('Profile completion status:', hasCompletedProfile ? 'Complete' : 'Incomplete');

            // Only redirect to profile setup if user is on dashboard but hasn't completed profile
            if (path === '/dashboard/creator' && !hasCompletedProfile && userData.role === 'creator') {
              console.log('User needs to complete profile, redirecting to setup');
              router.push('/dashboard/creator/profile-setup');
            }

            // Debug profile state from sessionStorage
            const profileComplete = typeof window !== 'undefined' 
              ? sessionStorage.getItem('profileComplete') 
              : null;
            
            console.log('🔍 Profile complete flag:', profileComplete);
            console.log('🔍 Current path:', window.location.pathname);
            
            // Debug any potential redirects
            if (window.location.pathname === '/dashboard/creator/profile-setup' && profileComplete === 'true') {
              console.log('⚠️ Detected potential redirect loop! User has completed profile but is on setup page');
              
              // Emergency break from redirect loop
              if (typeof window !== 'undefined') {
                console.log('🛑 EMERGENCY REDIRECT BREAK ACTIVATED');
                window.location.replace('/dashboard/creator?emergency=true');
              }
            }
          } else {
            // User exists in Auth but not in Firestore
            console.warn('User exists in Auth but not in Firestore:', user.uid);
            console.log('Attempting to create missing user document');
            
            // Attempt to create a basic user document with default role
            try {
              const basicUserData: UserData = {
                uid: user.uid,
                email: user.email || '',
                role: 'creator', // Default role
                createdAt: new Date(),
                updatedAt: new Date()
              };
              
              await setDoc(doc(db, 'users', user.uid), basicUserData);
              console.log('Created missing user document with basic data');
              dispatch({ type: 'AUTH_STATE_CHANGED', payload: basicUserData });
            } catch (createError) {
              console.error('Failed to create missing user document:', createError);
              dispatch({ type: 'AUTH_STATE_CHANGED', payload: null });
            }
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          // Still allow user to stay logged in with basic info
          const basicUserData: UserData = {
            uid: user.uid,
            email: user.email || '',
            role: 'creator', // Default role
            createdAt: new Date(),
            updatedAt: new Date()
          };
          dispatch({ type: 'AUTH_STATE_CHANGED', payload: basicUserData });
        }
      } else {
        // No user is signed in
        console.log('No user signed in, clearing auth state');
        dispatch({ type: 'AUTH_STATE_CHANGED', payload: null });
      }
      
      dispatch({ type: 'LOADING', payload: false });
    });

    // Cleanup subscription
    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        signUp,
        signIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} // review trigger
