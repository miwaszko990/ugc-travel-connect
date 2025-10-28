'use client';

import Link from 'next/link';
import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import { useAuth } from '@/app/hooks/auth';
import { registerSchema, RegisterFormValues } from '@/app/lib/validators';
import { FormField } from '@/app/components/ui/form-field';
import { AUTH_CONSTANTS } from '@/app/lib/constants/auth';
import { getAuthErrorType, getDashboardPath } from '@/app/lib/utils/auth-utils';

// Client component optimized for performance

// Lazy load heavy components with optimized loading states
const RoleSelector = dynamic(() => 
  import('@/app/components/ui/role-selector').then(mod => ({ default: mod.RoleSelector })), {
  ssr: false,
  loading: () => (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-neutral font-medium text-sm">I am a</span>
      </label>
      <div className="relative h-12 w-full bg-[#F4F4F5] rounded-xl animate-pulse"></div>
    </div>
  )
});



// Types
interface RoleOption {
  id: 'creator' | 'brand';
  name: string;
}

export default function RegisterPage() {
  // Use granular translations for better bundle splitting
  const t = useTranslations('auth-register');
  const locale = useLocale();
  const router = useRouter();
  const { signUp, loading, error } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  
  // Memoize roles to prevent recreation on every render
  const roles: RoleOption[] = useMemo(() => [
    { id: 'creator', name: t('creator') },
    { id: 'brand', name: t('brand') }
  ], [t]);
  
  const { 
    register, 
    handleSubmit, 
    setValue,
    formState: { errors } 
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  // Memoize callback to prevent unnecessary re-renders
  const handleRoleChange = useCallback((role: RoleOption) => {
    setSelectedRole(role);
    setValue('role', role.id);
  }, [setValue]);

  // Memoize submit handler
  const onSubmit = useCallback(async (data: RegisterFormValues) => {
    try {
      const user = await signUp(data.email, data.password, data.role);
      
      if (user) {
        router.push(getDashboardPath(data.role, locale));
      }
    } catch (error) {
      // Error handled by useAuth
      console.error('Registration failed:', error);
    }
  }, [signUp, router, locale]);

  // Memoize error processing for better performance
  const errorState = useMemo(() => {
    if (!error) return null;
    
    const errorType = getAuthErrorType(error);
    return {
      error,
      errorType,
      isExistingAccount: errorType === 'existing'
    };
  }, [error]);

  // Memoize button classes to prevent recalculation
  const buttonClasses = useMemo(() => 
    `btn px-6 py-3 h-auto ${AUTH_CONSTANTS.FORM.BUTTON_WIDTH} font-bold normal-case ${AUTH_CONSTANTS.FORM.BUTTON_RADIUS} border-none shadow-sm transition-all ${
      loading 
        ? 'bg-red-burgundy/90 cursor-not-allowed' 
        : 'bg-red-burgundy hover:bg-red-burgundy/90'
    }`, [loading]);

  // Memoize alert classes to prevent recalculation
  const alertClasses = useMemo(() => 
    `alert mb-4 rounded-[12px] py-2 text-sm ${errorState?.isExistingAccount ? 'alert-info' : 'alert-error'}`,
    [errorState?.isExistingAccount]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory p-4">
      <div className={`bg-white ${AUTH_CONSTANTS.FORM.CARD_RADIUS} shadow-lg p-8 ${AUTH_CONSTANTS.FORM.MAX_WIDTH} w-full`}>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-neutral mb-2 font-playfair">{t('welcome')}</h2>
          <p className="text-gray-500 text-sm font-inter">{t('joinMarketplace')}</p>
        </div>
        
        <div className="mb-5"></div>
        
        {errorState && (
          <div className={alertClasses}>
            <div className="flex flex-col items-start">
              <span>{errorState.error}</span>
              {errorState.isExistingAccount && (
                <Link href={AUTH_CONSTANTS.ROUTES.LOGIN} className="mt-2 text-red-burgundy underline font-semibold">
                  {t('clickToLogin')}
                </Link>
              )}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-inter">
          <FormField
            label={t('email')}
            type="email"
            placeholder={t('enterEmail')}
            error={errors.email}
            {...register('email')}
          />
          
          <FormField
            label={t('password')}
            type="password"
            placeholder={t('createPassword')}
            error={errors.password}
            {...register('password')}
          />
          
          <FormField
            label={t('confirmPassword')}
            type="password"
            placeholder={t('confirmPasswordPlaceholder')}
            error={errors.confirmPassword}
            {...register('confirmPassword')}
          />
          
          <RoleSelector
            label={t('role')}
            placeholder={t('selectRole')}
            options={roles}
            value={selectedRole}
            onChange={handleRoleChange}
            error={errors.role}
          />
          <input type="hidden" {...register('role')} />
          
          <div className="text-xs text-gray-500 mt-2">
            {t('terms')} <Link href={AUTH_CONSTANTS.ROUTES.TERMS} className="text-red-burgundy hover:underline">{t('termsOfService')}</Link> {t('and')} <Link href={AUTH_CONSTANTS.ROUTES.PRIVACY} className="text-red-burgundy hover:underline">{t('privacyPolicy')}</Link>.
          </div>
          
          <div className="form-control mt-5 flex items-center justify-center">
            <button 
              type="submit" 
              className={buttonClasses}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-white">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
                  <span className="text-white">{t('creatingAccount')}</span>
                </div>
              ) : (
                <span className="text-white">{t('signUp')}</span>
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-5">
          <p className="text-neutral text-sm font-inter">
            {t('alreadyHaveAccount')}{' '}
            <Link href={AUTH_CONSTANTS.ROUTES.LOGIN} className="text-red-burgundy font-semibold hover:underline">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
