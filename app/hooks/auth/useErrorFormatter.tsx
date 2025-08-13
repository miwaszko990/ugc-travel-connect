'use client';

import { useTranslations } from 'next-intl';
import type { FirebaseError } from './types';

// Fallback error messages when next-intl context is not available
const FALLBACK_ERROR_MESSAGES = {
  genericError: 'An unexpected error occurred. Please try again.',
  emailAlreadyInUse: 'This email address is already in use by another account.',
  invalidEmail: 'The email address is not valid.',
  weakPassword: 'Password should be at least 6 characters.',
  userNotFound: 'Invalid email or password.',
  tooManyRequests: 'Too many failed login attempts. Please try again later.',
  networkRequestFailed: 'Network error. Please check your connection and try again.',
};

/**
 * Hook to safely use error translations with fallback
 */
function useSafeErrorTranslations() {
  try {
    return useTranslations('auth.errors');
  } catch (error) {
    console.warn('Next-intl context not available for error formatting, using fallback messages');
    return (key: string) => FALLBACK_ERROR_MESSAGES[key as keyof typeof FALLBACK_ERROR_MESSAGES] || key;
  }
}

/**
 * Hook for formatting Firebase auth errors with i18n support
 */
export function useErrorFormatter() {
  const t = useSafeErrorTranslations();
  
  return (error: unknown): string => {
    if (!error || typeof error !== 'object') {
      return t('genericError');
    }
    
    const firebaseError = error as FirebaseError;
    const errorCode = firebaseError.code;
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return t('emailAlreadyInUse');
      case 'auth/invalid-email':
        return t('invalidEmail');
      case 'auth/weak-password':
        return t('weakPassword');
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return t('userNotFound');
      case 'auth/too-many-requests':
        return t('tooManyRequests');
      case 'auth/network-request-failed':
        return t('networkRequestFailed');
      default:
        return firebaseError.message || t('genericError');
    }
  };
}