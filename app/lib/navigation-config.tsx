import React from 'react';

// Icon components
export const NavigationIcons = {
  home: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  search: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  messages: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  bookings: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  edit: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  travel: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  earnings: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  settings: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
} as const;

// Brand navigation configuration
export const BRAND_NAV_ITEMS = [
  {
    key: 'home',
    href: '/',
    icon: NavigationIcons.home,
    translationNamespace: 'brand.navigation',
    index: 0
  },
  {
    key: 'browseCreators',
    href: '/dashboard/brand?tab=browse-creators',
    icon: NavigationIcons.search,
    translationNamespace: 'brand.navigation',
    index: 1
  },
  {
    key: 'messages',
    href: '/dashboard/brand?tab=messages',
    icon: NavigationIcons.messages,
    translationNamespace: 'brand.navigation',
    index: 2
  },
  {
    key: 'bookings',
    href: '/dashboard/brand?tab=bookings',
    icon: NavigationIcons.bookings,
    translationNamespace: 'brand.navigation',
    index: 3
  },
  {
    key: 'editProfile',
    href: '/dashboard/brand/profile-setup',
    icon: NavigationIcons.edit,
    translationNamespace: 'brand.navigation',
    index: 4
  }
] as const;

// Creator navigation configuration
export const CREATOR_NAV_ITEMS = [
  {
    key: 'home',
    href: '/',
    icon: NavigationIcons.home,
    translationNamespace: 'creator.navigation',
    index: 0
  },
  {
    key: 'travelPlans',
    href: '/dashboard/creator?tab=travel-plans',
    icon: NavigationIcons.travel,
    translationNamespace: 'creator.navigation',
    index: 1
  },
  {
    key: 'messages',
    href: '/dashboard/creator?tab=messages',
    icon: NavigationIcons.messages,
    translationNamespace: 'creator.navigation',
    index: 2
  },
  {
    key: 'earnings',
    href: '/dashboard/creator?tab=earnings',
    icon: NavigationIcons.earnings,
    translationNamespace: 'creator.navigation',
    index: 3
  },
  {
    key: 'editProfile',
    href: '/dashboard/creator/profile-setup',
    icon: NavigationIcons.edit,
    translationNamespace: 'creator.navigation',
    index: 4
  }
] as const;

// Mobile navigation items (shortened labels)
export const BRAND_MOBILE_NAV_ITEMS = [
  {
    key: 'home',
    href: '/',
    icon: NavigationIcons.home,
    translationNamespace: 'brand.navigation',
    index: 0
  },
  {
    key: 'browse',
    href: '/dashboard/brand?tab=browse-creators',
    icon: NavigationIcons.search,
    translationNamespace: 'brand.navigation',
    index: 1
  },
  {
    key: 'messages',
    href: '/dashboard/brand?tab=messages',
    icon: NavigationIcons.messages,
    translationNamespace: 'brand.navigation',
    index: 2
  },
  {
    key: 'bookings',
    href: '/dashboard/brand?tab=bookings',
    icon: NavigationIcons.bookings,
    translationNamespace: 'brand.navigation',
    index: 3
  },
  {
    key: 'profile',
    href: '/dashboard/brand/profile-setup',
    icon: NavigationIcons.edit,
    translationNamespace: 'brand.navigation',
    index: 4
  }
] as const;

export const CREATOR_MOBILE_NAV_ITEMS = [
  {
    key: 'home',
    href: '/',
    icon: NavigationIcons.home,
    translationNamespace: 'creator.navigation',
    index: 0
  },
  {
    key: 'travel',
    href: '/dashboard/creator?tab=travel-plans',
    icon: NavigationIcons.travel,
    translationNamespace: 'creator.navigation',
    index: 1
  },
  {
    key: 'messages',
    href: '/dashboard/creator?tab=messages',
    icon: NavigationIcons.messages,
    translationNamespace: 'creator.navigation',
    index: 2
  },
  {
    key: 'earnings',
    href: '/dashboard/creator?tab=earnings',
    icon: NavigationIcons.earnings,
    translationNamespace: 'creator.navigation',
    index: 3
  },
  {
    key: 'profile',
    href: '/dashboard/creator/profile-setup',
    icon: NavigationIcons.edit,
    translationNamespace: 'creator.navigation',
    index: 4
  }
] as const;

// Type definitions
export type BrandNavKey = typeof BRAND_NAV_ITEMS[number]['key'];
export type CreatorNavKey = typeof CREATOR_NAV_ITEMS[number]['key'];
export type BrandMobileNavKey = typeof BRAND_MOBILE_NAV_ITEMS[number]['key'];
export type CreatorMobileNavKey = typeof CREATOR_MOBILE_NAV_ITEMS[number]['key'];

export type NavigationItemBase<T extends string = string> = {
  key: T;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  translationNamespace: string;
  index: number;
};

export type BrandNavigationItem = typeof BRAND_NAV_ITEMS[number];
export type CreatorNavigationItem = typeof CREATOR_NAV_ITEMS[number];
export type BrandMobileNavigationItem = typeof BRAND_MOBILE_NAV_ITEMS[number];
export type CreatorMobileNavigationItem = typeof CREATOR_MOBILE_NAV_ITEMS[number];

// Navigation configuration getter functions
export const getNavigationConfig = (role: 'brand' | 'creator', isMobile: boolean = false) => {
  if (role === 'brand') {
    return isMobile ? BRAND_MOBILE_NAV_ITEMS : BRAND_NAV_ITEMS;
  }
  return isMobile ? CREATOR_MOBILE_NAV_ITEMS : CREATOR_NAV_ITEMS;
};

// Profile setup paths
export const PROFILE_SETUP_PATHS = {
  brand: '/dashboard/brand/profile-setup',
  creator: '/dashboard/creator/profile-setup'
} as const;

// Default profile images
export const DEFAULT_PROFILE_IMAGES = {
  brand: '/images/default-avatar.jpg',
  creator: '/images/default-avatar.jpg'
} as const; 