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

// Portfolio item type for creator profiles
export interface PortfolioItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string; // For videos
  title?: string;
  description?: string;
  uploadedAt: string; // ISO date string
  order?: number; // Optional ordering
}

// Put any non-Firebase related types here

// Firebase-related types have been moved to useAuth.tsx // review trigger

// Job and Application types for Zlecenia feature
export interface Job {
  id: string;
  brandId: string;
  brandName: string;
  brandLogoUrl?: string;
  title: string;
  description: string;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  location?: string;
  requirements?: string[];
  deliverables?: string[];
  category?: string;
  deadline?: string; // ISO date string
  status: 'open' | 'closed' | 'archived';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  applicationsCount?: number;
}

export interface Application {
  id: string;
  jobId: string;
  creatorId: string;
  creatorName: string;
  creatorProfileUrl?: string;
  creatorInstagram?: string;
  message: string;
  portfolioLinks?: string[];
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
