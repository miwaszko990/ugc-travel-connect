'use client';

import { useTranslations } from 'next-intl';
import type { FirebaseError } from './types';

/**
 * Hook for formatting Firebase auth errors with i18n support
 */
export function useErrorFormatter() {
  const t = useTranslations('auth.errors');
  
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