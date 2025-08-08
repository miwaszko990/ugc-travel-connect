import type { AuthState, AuthAction } from './types';

// Initial auth state
export const initialAuthState: AuthState = {
  user: null,
  loading: true,
  error: null
};

/**
 * Auth reducer for managing authentication state
 */
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_STATE_CHANGED':
      return {
        ...state,
        user: action.payload,
        loading: false
      };
    case 'LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
} 