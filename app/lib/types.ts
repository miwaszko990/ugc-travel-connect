// Importing UserRole and UserData from useAuth to ensure consistency
import { UserRole, UserData } from '@/app/hooks/useAuth';

// Export types for use in other components
export type { UserRole, UserData };

// Additional application-specific types can be added here
export type ProfileData = {
  firstName: string;
  lastName: string;
  instagramHandle: string;
  followerCount: number;
  homeCity: string;
  profileImageUrl?: string;
};

// Put any non-Firebase related types here

// Firebase-related types have been moved to useAuth.tsx 