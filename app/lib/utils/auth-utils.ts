import { AUTH_ERROR_TYPES, AuthErrorType } from '../constants/auth';

/**
 * Determines the type of authentication error based on error message
 */
export function getAuthErrorType(error: string | null): AuthErrorType {
  if (!error) return 'generic';
  
  const isExistingAccount = AUTH_ERROR_TYPES.EXISTING_ACCOUNT.some(
    errorType => error.includes(errorType)
  );
  
  return isExistingAccount ? 'existing' : 'generic';
}

/**
 * Gets the appropriate dashboard path based on user role
 */
export function getDashboardPath(role: 'creator' | 'brand'): string {
  return role === 'creator' 
    ? '/dashboard/creator/profile-setup' 
    : '/dashboard/brand/profile-setup';
} 