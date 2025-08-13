'use client';

import React, { ReactNode, useReducer, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// NOTE: Do not call useTranslations directly at module scope; we will access it safely inside the component
// import { useTranslations } from 'next-intl';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { toast } from 'react-hot-toast';

import { auth } from '@/app/lib/firebase';
import { createUserDocument, getUserDocument } from '@/app/lib/firebase/utils';
import { AuthContext } from '@/app/hooks/auth/useAuthContext';
import { authReducer, initialAuthState } from '@/app/hooks/auth/authReducer';
import { useErrorFormatter } from '@/app/hooks/auth/useErrorFormatter';
import { 
  navigateToDashboard, 
  handleAuthenticatedUser, 
  createBasicUserData 
} from '@/app/hooks/auth/authUtils';
import { AuthErrorBoundary } from './AuthErrorBoundary';
import type { UserData, UserRole } from '@/app/hooks/auth/types';

// Safe translation accessor so the provider doesn't crash outside NextIntlClientProvider
function useSafeT(namespace: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {useTranslations} = require('next-intl');
    return useTranslations(namespace);
  } catch {
    // Fallback: echo keys so UI remains functional during boot or on non-localized routes
    return ((key: string) => key) as (key: string, vars?: any) => string;
  }
}

/**
 * Internal AuthProvider implementation
 */
function AuthProviderInner({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const router = useRouter();
  const t = useSafeT('auth.messages');
  const formatError = useErrorFormatter();

  // Clear error on route change
  useEffect(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [router]);

  // Memoize auth functions for stable references
  const signUp = useCallback(async (email: string, password: string, role: UserRole): Promise<UserData | null> => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore using utility function
      try {
        const userData = await createUserDocument(user.uid, email, role);

        // Update state
        dispatch({ type: 'AUTH_STATE_CHANGED', payload: userData });
        
        // Show success message with i18n
        toast.success(t('accountCreatedSuccess'));
        
        return userData;
        
      } catch (firestoreError) {
        console.error('Failed to create user document:', firestoreError);
        
        // Even if Firestore fails, still proceed with basic user info
        const basicUserData = createBasicUserData(user);
        
        dispatch({ type: 'AUTH_STATE_CHANGED', payload: basicUserData });
        toast.error(t('accountCreatedLimited'));
        
        return basicUserData;
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = formatError(error);
      dispatch({ type: 'ERROR', payload: errorMessage });
      dispatch({ type: 'LOADING', payload: false });
      return null;
    }
  }, [t, formatError]);

  // Enhanced sign in with better navigation logic
  const signIn = useCallback(async (email: string, password: string) => {
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
        
        // Navigate to appropriate dashboard
        navigateToDashboard(userData.role, router);
      } else {
        // User exists in Auth but not in Firestore
        const errorMessage = t('userAccountIncomplete');
        dispatch({ type: 'ERROR', payload: errorMessage });
        dispatch({ type: 'LOADING', payload: false });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = formatError(error);
      dispatch({ type: 'ERROR', payload: errorMessage });
      dispatch({ type: 'LOADING', payload: false });
    }
  }, [t, formatError, router]);

  // Enhanced logout with error handling
  const logout = useCallback(async () => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      await signOut(auth);
      dispatch({ type: 'AUTH_STATE_CHANGED', payload: null });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      const errorMessage = formatError(error);
      dispatch({ type: 'ERROR', payload: errorMessage });
      dispatch({ type: 'LOADING', payload: false });
    }
  }, [formatError, router]);

  // Enhanced auth state listener with better error handling
  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔍 Auth state changed:', user ? `User ${user.uid}` : 'No user');
      
      if (user) {
        try {
          await handleAuthenticatedUser(user, router, dispatch);
        } catch (error) {
          console.error('Error handling auth state change:', error);
          // Still allow user to stay logged in with basic info
          const basicUserData = createBasicUserData(user);
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

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user: state.user,
    loading: state.loading,
    error: state.error,
    signUp,
    signIn,
    logout,
  }), [state.user, state.loading, state.error, signUp, signIn, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Main AuthProvider component with error boundary
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthErrorBoundary>
      <AuthProviderInner>{children}</AuthProviderInner>
    </AuthErrorBoundary>
  );
} 