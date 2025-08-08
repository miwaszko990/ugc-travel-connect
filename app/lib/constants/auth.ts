// Authentication related constants
export const AUTH_CONSTANTS = {
  FORM: {
    MAX_WIDTH: 'max-w-[420px]',
    CARD_RADIUS: 'rounded-[24px]',
    BUTTON_RADIUS: 'rounded-[12px]',
    BUTTON_WIDTH: 'w-4/5',
  },
  ROUTES: {
    LOGIN: '/auth/login',
    TERMS: '/terms',
    PRIVACY: '/privacy',
    CREATOR_SETUP: '/dashboard/creator/profile-setup',
    BRAND_SETUP: '/dashboard/brand/profile-setup',
  },
} as const;

// Error types for account validation
export const AUTH_ERROR_TYPES = {
  EXISTING_ACCOUNT: ['already registered', 'email-already-in-use', 'already exists'],
} as const;

export type AuthErrorType = 'existing' | 'generic'; 