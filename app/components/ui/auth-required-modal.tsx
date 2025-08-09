'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import { MODAL_CONSTANTS, BUTTON_VARIANTS } from '@/app/lib/constants/ui';

// Client component optimized for performance

// Lazy load heavy components with SSR disabled for better performance
const ModalIcon = dynamic(() => 
  import('@/app/components/ui/modal/modal-icon').then(mod => ({ default: mod.ModalIcon })), {
  ssr: false,
  loading: () => (
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-burgundy/10 animate-pulse" />
  )
});

// Lazy load the optimized modal animation hook
const useOptimizedModal = dynamic(() => 
  import('@/app/hooks/ui/useOptimizedModal').then(mod => ({ default: mod.useOptimizedModal })), {
  ssr: false
});

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName?: string;
}

/**
 * High-performance modal component with optimizations:
 * - Lazy loading of heavy components
 * - Memoized handlers and computed values
 * - Edge Runtime compatibility
 * - Granular translation loading
 */
function AuthRequiredModal({ 
  isOpen, 
  onClose, 
  creatorName 
}: AuthRequiredModalProps) {
  const router = useRouter();
  
  // Load only modal-specific translations for better bundle splitting
  const t = useTranslations('auth-modal');
  
  // Memoized navigation handlers to prevent re-renders
  const handleLogin = useCallback(() => {
    router.push('/auth/login');
  }, [router]);

  const handleSignUp = useCallback(() => {
    router.push('/auth/register');
  }, [router]);

  // Memoized modal description to prevent recalculation on every render
  const modalDescription = useMemo(() => {
    return creatorName 
      ? t('loginRequiredMessage', { creatorName: `${creatorName}'s` })
      : t('loginRequiredGeneric');
  }, [creatorName, t]);

  // Memoized class names for consistent performance
  const backdropClasses = useMemo(() => 
    `${MODAL_CONSTANTS.STYLES.OVERLAY} ${MODAL_CONSTANTS.ANIMATION.DURATION} opacity-50`,
    []
  );

  const modalClasses = useMemo(() => 
    `${MODAL_CONSTANTS.STYLES.MODAL} ${MODAL_CONSTANTS.SIZING.MAX_WIDTH_MD} ${MODAL_CONSTANTS.SPACING.MODAL_PADDING} ${MODAL_CONSTANTS.ANIMATION.DURATION} scale-100 opacity-100`,
    []
  );

  // Early return optimization - don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <div className={MODAL_CONSTANTS.STYLES.BACKDROP}>
      <div className={MODAL_CONSTANTS.STYLES.CONTAINER}>
        {/* Optimized backdrop with pre-computed classes */}
        <div 
          className={backdropClasses}
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal content with optimized rendering */}
        <div 
          className={modalClasses}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className="text-center">
            {/* Modal title */}
            <h3 
              id="modal-title"
              className={`text-xl font-semibold text-red-burgundy ${MODAL_CONSTANTS.SPACING.SECTION_MARGIN}`}
            >
              {t('loginRequired')}
            </h3>
        
            {/* Lazy-loaded icon with performance-optimized loading state */}
            <ModalIcon variant="error" className="bg-red-burgundy/10 text-red-burgundy">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </ModalIcon>
            
            {/* Pre-computed modal description */}
            <p 
              id="modal-description"
              className="text-sm text-gray-600 mb-6"
            >
              {modalDescription}
            </p>
        
            {/* Action buttons with stable memoized handlers */}
            <div className={MODAL_CONSTANTS.SPACING.BUTTON_SPACING}>
              <button 
                className={`w-full ${BUTTON_VARIANTS.PRIMARY}`}
                onClick={handleLogin}
                type="button"
              >
                {t('logIn')}
              </button>
              
              <button 
                className={`w-full ${BUTTON_VARIANTS.SECONDARY}`}
                onClick={handleSignUp}
                type="button"
              >
                {t('signUp')}
              </button>
            </div>
        
            {/* Cancel button */}
            <button 
              className={`mt-4 ${BUTTON_VARIANTS.TERTIARY}`}
              onClick={onClose}
              type="button"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export with React.memo to prevent unnecessary re-renders
export default memo(AuthRequiredModal);
