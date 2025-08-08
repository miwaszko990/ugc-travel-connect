'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook for modal animation and body scroll management
 * @param isOpen - Whether the modal is open
 * @returns isVisible - Whether the modal should be visible (for animations)
 */
export function useModalAnimation(isOpen: boolean) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure transition works properly
      const timer = setTimeout(() => setIsVisible(true), 10);
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      setIsVisible(false);
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount - restore body scroll
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  return isVisible;
} 