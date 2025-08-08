import { AUTH_ERROR_TYPES, AuthErrorType } from '../constants/auth';

/**
 * Determines the type of authentication error based on error message
 */
export function getAuthErrorType(error: string | null): AuthErrorType {
  if (!error) return 'generic';
  
  const isExistingAccount = AUTH_ERROR_TYPES.EXISTING_ACCOUNT.some(
    errorType => error.includes(errorType)
  );
  
  const isCredentialError = AUTH_ERROR_TYPES.CREDENTIAL_ERROR.some(
    errorType => error.includes(errorType)
  );
  
  const needsRegistration = AUTH_ERROR_TYPES.NEEDS_REGISTRATION.some(
    errorType => error.includes(errorType)
  );
  
  if (isExistingAccount) return 'existing';
  if (isCredentialError) return 'credential';
  if (needsRegistration) return 'registration';
  
  return 'generic';
}

/**
 * Gets the appropriate dashboard path based on user role
 */
export function getDashboardPath(role: 'creator' | 'brand'): string {
  return role === 'creator' 
    ? '/dashboard/creator/profile-setup' 
    : '/dashboard/brand/profile-setup';
}

/**
 * Login-specific error analysis
 */
export interface LoginErrorState {
  needsRegistration: boolean;
  isCredentialError: boolean;
  errorType: AuthErrorType;
}

export function getLoginErrorState(error: string | null): LoginErrorState {
  const errorType = getAuthErrorType(error);
  
  return {
    needsRegistration: errorType === 'registration',
    isCredentialError: errorType === 'credential',
    errorType
  };
} 