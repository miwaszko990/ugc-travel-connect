'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Optimized modal hook with improved performance
 * - Debounced visibility changes
 * - Proper cleanup management
 * - Memory leak prevention
 */
export function useOptimizedModal(isOpen: boolean) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  // Memoized cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    document.body.style.overflow = 'unset';
  }, []);
  
  useEffect(() => {
    cleanupRef.current = cleanup;
    
    if (isOpen) {
      // Prevent body scroll immediately
      document.body.style.overflow = 'hidden';
      
      // Debounced visibility for smooth animation
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        timeoutRef.current = null;
      }, 10);
    } else {
      // Immediate visibility change for closing
      setIsVisible(false);
      
      // Delayed scroll restoration for smooth animation
      timeoutRef.current = setTimeout(() => {
        document.body.style.overflow = 'unset';
        timeoutRef.current = null;
      }, 300); // Match animation duration
    }
    
    // Cleanup on unmount or dependency change
    return cleanup;
  }, [isOpen, cleanup]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);
  
  return isVisible;
} 