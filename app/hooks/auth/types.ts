// Auth-related type definitions

export type UserRole = 'creator' | 'brand';

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Profile fields
  firstName?: string;
  lastName?: string;
  instagramHandle?: string;
  followerCount?: number;
  homeCity?: string;
  profileImageUrl?: string;
  profileComplete?: boolean;
  // Instagram integration fields
  instagramConnected?: boolean;
  instagramAccessToken?: string;
  instagramUserId?: string;
  instagramTokenExpiry?: Date;
  instagramLastSync?: Date;
  // Brand specific fields
  brandName?: string;
  website?: string;
  industry?: string;
  logoImageUrl?: string;
}

export interface AuthState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
}

export type AuthAction = 
  | { type: 'AUTH_STATE_CHANGED'; payload: UserData | null }
  | { type: 'LOADING'; payload: boolean }
  | { type: 'ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

export interface AuthErrorBoundaryState {
  hasError: boolean;
  error: unknown;
}

export interface FirebaseError {
  code?: string;
  message?: string;
} 