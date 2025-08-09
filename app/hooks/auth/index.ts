// Main auth exports
export { useAuth } from './useAuthContext';
export { AuthProvider } from '../../components/auth/AuthProvider';

// Types
export type { 
  UserData, 
  UserRole, 
  AuthState, 
  AuthAction,
  AuthErrorBoundaryState,
  FirebaseError
} from './types';

// Utilities (for advanced usage)
export { 
  navigateToDashboard,
  createBasicUserData,
  handleAuthenticatedUser,
  handleAuthenticatedNavigation,
  handleRedirectLoopPrevention,
  handleMissingUserDocument
} from './authUtils';

// Hooks (for custom implementations)
export { useErrorFormatter } from './useErrorFormatter';

// State management (for testing)
export { authReducer, initialAuthState } from './authReducer'; 