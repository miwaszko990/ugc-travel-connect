'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { loginSchema, LoginFormValues } from '@/app/lib/validators';
import { FormField } from '@/app/components/ui/form-field';
import { AUTH_CONSTANTS } from '@/app/lib/constants/auth';
import { getLoginErrorState } from '@/app/lib/utils/auth-utils';
import { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Optimize for Vercel Edge Runtime
export const runtime = 'edge'
export const preferredRegion = 'auto'

// Lazy load LanguageSwitcher - it's not critical for login functionality
const LanguageSwitcher = dynamic(
  () => import('@/app/components/ui/language-switcher').then(mod => ({ default: mod.LanguageSwitcher })),
  { 
    ssr: false,
    loading: () => <div className="w-20 h-8 bg-gray-100 rounded animate-pulse" />
  }
)

// Constants for better performance and maintainability
const FORM_TIMEOUT = 30000; // 30 seconds
const RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_ATTEMPTS = 3;

export default function LoginPage() {
  // Use granular auth namespace for optimal bundle size
  const t = useTranslations('auth');
  const { signIn, loading, error } = useAuth();
  const router = useRouter();
  
  // Local state for enhanced UX
  const [isOnline, setIsOnline] = useState(true);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting, isValid, isDirty },
    setError,
    clearErrors,
    reset
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial state
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  // Memoize error analysis using utility function
  const errorState = useMemo(() => getLoginErrorState(error), [error]);

  // Enhanced submit handler with timeout, retry logic, and throttling
  const onSubmit = useCallback(async (data: LoginFormValues) => {
    try {
      // Prevent rapid submissions (throttling)
      const now = Date.now();
      if (now - lastSubmitTime < 1000) {
        return;
      }
      setLastSubmitTime(now);

      // Check online status
      if (!isOnline) {
        setError('root', { 
          message: 'No internet connection. Please check your network and try again.' 
        });
        return;
      }

      // Clear previous errors
      clearErrors();
      setIsRetrying(false);

      // Set timeout for submission
      const submitPromise = signIn(data.email, data.password);
      const timeoutPromise = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Request timeout. Please try again.'));
        }, FORM_TIMEOUT);
      });

      try {
        await Promise.race([submitPromise, timeoutPromise]);
        
        // Clear timeout if successful
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Reset retry attempts on success
        setSubmitAttempts(0);
        
      } catch (submitError: any) {
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Handle specific error types
        if (submitError.message.includes('timeout')) {
          handleRetryableError('Request timed out');
        } else if (submitError.message.includes('network')) {
          handleRetryableError('Network error occurred');
        } else {
          // Let the auth hook handle other errors
          throw submitError;
        }
      }
      
    } catch (error: any) {
      console.error('Login submission error:', error);
      setError('root', { 
        message: error.message || 'An unexpected error occurred. Please try again.' 
      });
    }
  }, [signIn, isOnline, lastSubmitTime, setError, clearErrors]);

  // Handle retryable errors with exponential backoff
  const handleRetryableError = useCallback((errorMessage: string) => {
    setSubmitAttempts(prev => prev + 1);
    
    if (submitAttempts < MAX_RETRY_ATTEMPTS) {
      setIsRetrying(true);
      const delay = RETRY_DELAY * Math.pow(2, submitAttempts); // Exponential backoff
      
      retryTimeoutRef.current = setTimeout(() => {
        setIsRetrying(false);
        setError('root', { 
          message: `${errorMessage}. Retry ${submitAttempts + 1}/${MAX_RETRY_ATTEMPTS} failed.` 
        });
      }, delay);
    } else {
      setError('root', { 
        message: `${errorMessage}. Maximum retry attempts reached. Please refresh and try again.` 
      });
      setSubmitAttempts(0);
    }
  }, [submitAttempts, setError]);

  // Manual retry function
  const handleRetry = useCallback(() => {
    setSubmitAttempts(0);
    setIsRetrying(false);
    clearErrors();
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, [clearErrors]);

  // Memoize button state and classes to prevent recalculation
  const buttonState = useMemo(() => {
    const isDisabled = loading || isSubmitting || !isValid || !isDirty || !isOnline || isRetrying;
    const baseClasses = `btn px-6 py-3 h-auto ${AUTH_CONSTANTS.FORM.BUTTON_WIDTH} font-bold normal-case ${AUTH_CONSTANTS.FORM.BUTTON_RADIUS} border-none shadow-sm transition-all`;
    
    let stateClasses = '';
    if (isDisabled) {
      stateClasses = 'bg-red-burgundy/60 cursor-not-allowed';
    } else {
      stateClasses = 'bg-red-burgundy hover:bg-red-burgundy/90 active:bg-red-burgundy/95';
    }
    
    return {
      isDisabled,
      className: `${baseClasses} ${stateClasses}`
    };
  }, [loading, isSubmitting, isValid, isDirty, isOnline, isRetrying]);

  // Memoize alert classes with enhanced error states
  const alertClasses = useMemo(() => {
    const baseClasses = 'alert mb-4 rounded-[12px] py-3 px-4 text-sm';
    
    if (!isOnline) {
      return `${baseClasses} alert-warning border-l-4 border-orange-400`;
    }
    
    if (isRetrying) {
      return `${baseClasses} alert-info border-l-4 border-blue-400`;
    }
    
    if (errorState.needsRegistration) {
      return `${baseClasses} alert-info border-l-4 border-blue-400`;
    }
    
    return `${baseClasses} alert-error border-l-4 border-red-400`;
  }, [errorState.needsRegistration, isOnline, isRetrying]);

  // Memoize form state for accessibility
  const formAriaProperties = useMemo(() => ({
    'aria-busy': loading || isSubmitting,
    'aria-live': 'polite',
    'aria-atomic': 'true'
  }), [loading, isSubmitting]);

  // Render error message with enhanced UX
  const renderErrorMessage = useCallback(() => {
    if (!isOnline) {
      return (
        <div className={alertClasses}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <span className="font-medium">You're offline</span>
              <p className="mt-1 text-xs">Please check your internet connection and try again.</p>
            </div>
          </div>
        </div>
      );
    }

    if (isRetrying) {
      return (
        <div className={alertClasses}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <span className="font-medium">Retrying connection...</span>
              <p className="mt-1 text-xs">Attempting to reconnect. Please wait.</p>
            </div>
          </div>
        </div>
      );
    }

    if (error || errors.root) {
      const displayError = error || errors.root?.message;
      return (
        <div className={alertClasses}>
          <div className="flex flex-col items-start">
            <span className="font-medium">{displayError}</span>
            {errorState.needsRegistration && (
              <Link href={AUTH_CONSTANTS.ROUTES.REGISTER} className="mt-2 text-red-burgundy underline font-semibold hover:text-red-burgundy/80">
                {t('clickToRegister')}
              </Link>
            )}
            {errorState.isCredentialError && (
              <Link href={AUTH_CONSTANTS.ROUTES.FORGOT_PASSWORD} className="mt-2 text-red-burgundy underline font-semibold hover:text-red-burgundy/80">
                {t('forgotYourPassword')}
              </Link>
            )}
            {submitAttempts >= MAX_RETRY_ATTEMPTS && (
              <button 
                onClick={handleRetry}
                className="mt-2 text-blue-600 underline font-semibold hover:text-blue-600/80"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      );
    }

    return null;
  }, [isOnline, isRetrying, error, errors.root, errorState, alertClasses, submitAttempts, handleRetry, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory p-4">
      <div className={`bg-white ${AUTH_CONSTANTS.FORM.CARD_RADIUS} shadow-lg p-8 ${AUTH_CONSTANTS.FORM.MAX_WIDTH} w-full`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral mb-2 font-playfair">{t('welcomeBack')}</h1>
            <p className="text-gray-500 text-sm font-inter">{t('loginToAccount')}</p>
          </div>
          <LanguageSwitcher />
        </div>
        
        <div className="mb-5"></div>
        
        {renderErrorMessage()}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-inter" {...formAriaProperties}>
          <FormField
            label={t('email')}
            type="email"
            placeholder={t('enterYourEmail')}
            error={errors.email}
            autoComplete="email"
            required
            {...register('email')}
          />
          
          <div className="form-control">
            <FormField
              label={t('password')}
              type="password"
              placeholder={t('enterPassword')}
              error={errors.password}
              autoComplete="current-password"
              required
              {...register('password')}
            />
            <div className="flex justify-end mt-1">
              <Link href={AUTH_CONSTANTS.ROUTES.FORGOT_PASSWORD} className="text-xs text-red-burgundy hover:underline focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 rounded">
                {t('forgotPassword')}
              </Link>
            </div>
          </div>
          
          <div className="form-control mt-5 flex items-center justify-center">
            <button 
              type="submit" 
              className={buttonState.className}
              disabled={buttonState.isDisabled}
              aria-describedby={error ? "login-error" : undefined}
            >
              {loading || isSubmitting ? (
                <div className="flex items-center gap-2 text-white">
                  <span className="loading loading-spinner loading-sm text-white"></span>
                  <span>{t('signingIn')}</span>
                </div>
              ) : isRetrying ? (
                <div className="flex items-center gap-2 text-white">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Retrying...</span>
                </div>
              ) : (
                <span className="text-white">{t('login')}</span>
              )}
            </button>
          </div>
          
          {/* Enhanced form state indicators */}
          {!isOnline && (
            <div className="text-center text-xs text-orange-600">
              Connection unavailable - form disabled
            </div>
          )}
          {submitAttempts > 0 && submitAttempts < MAX_RETRY_ATTEMPTS && (
            <div className="text-center text-xs text-blue-600">
              Retry attempt {submitAttempts}/{MAX_RETRY_ATTEMPTS}
            </div>
          )}
        </form>
        
        <div className="text-center mt-5">
          <p className="text-neutral text-sm font-inter">
            {t('dontHaveAccount')}{' '}
            <Link 
              href={AUTH_CONSTANTS.ROUTES.REGISTER} 
              className="text-red-burgundy font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 rounded"
            >
              {t('signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
