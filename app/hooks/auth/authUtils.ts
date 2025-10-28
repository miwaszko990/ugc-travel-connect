import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { getUserDocument } from '@/app/lib/firebase/utils';
import type { UserData, UserRole, AuthAction } from './types';

function localePrefix(): string {
  if (typeof window === 'undefined') return '/pl';
  const segments = window.location.pathname.split('/').filter(Boolean);
  // Find the locale segment (pl, en, etc.) - it should be the first valid locale
  const validLocales = ['pl', 'en'];
  const locale = segments.find(seg => validLocales.includes(seg)) || 'pl';
  return `/${locale}`;
}

/**
 * Navigate to appropriate dashboard based on user role
 */
export function navigateToDashboard(role: UserRole, router: ReturnType<typeof useRouter>) {
  const lp = localePrefix();
  if (role === 'creator') {
    router.push(`${lp}/dashboard/creator?tab=travel-plans`);
  } else if (role === 'brand') {
    router.push(`${lp}/dashboard/brand`);
  } else {
    router.push(`${lp}/dashboard`);
  }
}

/**
 * Create basic user data fallback
 */
export function createBasicUserData(user: { uid: string; email: string | null }): UserData {
  return {
    uid: user.uid,
    email: user.email || '',
    role: 'creator', // Default role
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Handle authenticated user state changes
 */
export async function handleAuthenticatedUser(
  user: { uid: string; email: string | null },
  router: ReturnType<typeof useRouter>,
  dispatch: React.Dispatch<AuthAction>
) {
  // Get user data from Firestore using utility function
  const userData = await getUserDocument(user.uid);
  
  if (userData) {
    // User document exists in Firestore
    console.log('User document found, updating state');
    dispatch({ type: 'AUTH_STATE_CHANGED', payload: userData });
    
    // Handle navigation for authenticated users
    handleAuthenticatedNavigation(userData, router);
  } else {
    // User exists in Auth but not in Firestore - attempt recovery
    await handleMissingUserDocument(user, dispatch);
  }
}

/**
 * Handle navigation logic for authenticated users
 */
export function handleAuthenticatedNavigation(
  userData: UserData,
  router: ReturnType<typeof useRouter>
) {
  if (typeof window === 'undefined') return;
  
  const path = window.location.pathname;
  const lp = localePrefix();
  console.log('Current path during auth check:', path);
  
  // Redirect from auth pages if already logged in
  if ((path.endsWith('/auth/login') || path.endsWith('/auth/register')) && userData.role) {
    console.log('User already logged in, redirecting to dashboard');
    navigateToDashboard(userData.role, router);
    return;
  }
  
  // Handle profile completion redirect
  const hasCompletedProfile = userData.firstName && userData.lastName;
  console.log('Profile completion status:', hasCompletedProfile ? 'Complete' : 'Incomplete');

  if (path.endsWith('/dashboard/creator') && !hasCompletedProfile && userData.role === 'creator') {
    console.log('User needs to complete profile, redirecting to setup');
    router.push(`${lp}/dashboard/creator/profile-setup`);
    return;
  }

  // Handle potential redirect loops
  handleRedirectLoopPrevention(router);
}

/**
 * Prevent infinite redirect loops
 */
export function handleRedirectLoopPrevention(router: ReturnType<typeof useRouter>) {
  if (typeof window === 'undefined') return;
  
  const profileComplete = sessionStorage.getItem('profileComplete');
  const currentPath = window.location.pathname;
  const lp = localePrefix();
  
  console.log('🔍 Profile complete flag:', profileComplete);
  console.log('🔍 Current path:', currentPath);
  
  // Emergency break from redirect loop
  if (currentPath.endsWith('/dashboard/creator/profile-setup') && profileComplete === 'true') {
    console.log('⚠️ Detected potential redirect loop! User has completed profile but is on setup page');
    console.log('🛑 EMERGENCY REDIRECT BREAK ACTIVATED');
    window.location.replace(`${lp}/dashboard/creator?tab=travel-plans&emergency=true`);
  }
}

/**
 * Handle missing user document recovery
 */
export async function handleMissingUserDocument(
  user: { uid: string; email: string | null },
  dispatch: React.Dispatch<AuthAction>
) {
  console.warn('⚠️ User exists in Auth but not in Firestore:', user.uid);
  console.log('🔧 Attempting to create missing user document with retry logic');
  
  try {
    // Try to get the document one more time with a small delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userRef = doc(db, 'users', user.uid);
    const retrySnapshot = await getDoc(userRef);
    
    if (retrySnapshot.exists()) {
      console.log('✅ User document found on retry');
      const userData = retrySnapshot.data() as UserData;
      dispatch({ type: 'AUTH_STATE_CHANGED', payload: userData });
      return;
    }
    
    // Document still doesn't exist, create basic user data
    const basicUserData = createBasicUserData(user);
    await setDoc(userRef, basicUserData, { merge: true });
    console.log('✅ Created missing user document with basic data');
    dispatch({ type: 'AUTH_STATE_CHANGED', payload: basicUserData });
  } catch (createError) {
    console.error('❌ Failed to create missing user document:', createError);
    // Don't set user to null, let them stay logged in with minimal data
    const fallbackData = createBasicUserData(user);
    dispatch({ type: 'AUTH_STATE_CHANGED', payload: fallbackData });
  }
} 