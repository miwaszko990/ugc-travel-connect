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
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    TERMS: '/terms',
    PRIVACY: '/privacy',
    CREATOR_SETUP: '/dashboard/creator/profile-setup',
    BRAND_SETUP: '/dashboard/brand/profile-setup',
  },
  TIMEOUTS: {
    FORM_SUBMIT: 30000, // 30 seconds
    RETRY_DELAY: 2000,  // 2 seconds
    THROTTLE_DELAY: 1000, // 1 second
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    BACKOFF_MULTIPLIER: 2,
  },
} as const;

// Error types for account validation
export const AUTH_ERROR_TYPES = {
  EXISTING_ACCOUNT: ['already registered', 'email-already-in-use', 'already exists'],
  CREDENTIAL_ERROR: ['Invalid email or password', 'wrong password'],
  NEEDS_REGISTRATION: ['register', 'create a profile', 'Account not found'],
  NETWORK_ERROR: ['network', 'timeout', 'fetch'],
  RATE_LIMIT: ['too many requests', 'rate limit'],
} as const;

export type AuthErrorType = 'existing' | 'credential' | 'registration' | 'network' | 'rate_limit' | 'generic'; 