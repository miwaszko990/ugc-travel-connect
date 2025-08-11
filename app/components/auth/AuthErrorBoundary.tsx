'use client';

import React, { ReactNode } from 'react';
import type { AuthErrorBoundaryState } from '@/app/hooks/auth/types';

/**
 * Error fallback component - simple version without translations to avoid context issues
 */
function AuthErrorFallback() {
  return (
    <div className="p-4 bg-red-50 text-red-700 rounded-lg">
      <h2 className="text-lg font-semibold">Authentication Error</h2>
      <p className="text-sm">Please refresh the page and try again.</p>
    </div>
  );
}

/**
 * Enhanced error boundary for auth-related errors
 */
export class AuthErrorBoundary extends React.Component<
  { children: ReactNode },
  AuthErrorBoundaryState
> {
  state: AuthErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('Auth Error Boundary:', error, errorInfo);
    
    // Here you could send to error monitoring service
    // errorLogger.captureException(error, { context: 'AuthErrorBoundary', errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <AuthErrorFallback />;
    }
    return this.props.children;
  }
} 