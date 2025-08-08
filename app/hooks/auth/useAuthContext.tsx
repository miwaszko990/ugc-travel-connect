'use client';

import { createContext, useContext } from 'react';
import type { UserData, UserRole } from './types';

// Context type definition
export interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, role: UserRole) => Promise<UserData | null>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context
export const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 