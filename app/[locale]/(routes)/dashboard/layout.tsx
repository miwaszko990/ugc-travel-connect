'use client';

import { useAuth } from '@/app/hooks/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('dashboard.loading');

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    if (!loading && user) {
      // Role-based route protection
      if (pathname.includes('/dashboard/creator') && user.role !== 'creator') {
        // Brand trying to access creator dashboard
        if (user.role === 'brand') {
          router.push(`/${locale}/dashboard/brand`);
        } else {
          router.push(`/${locale}/dashboard`);
        }
        return;
      }

      if (pathname.includes('/dashboard/brand') && user.role !== 'brand') {
        // Creator trying to access brand dashboard
        if (user.role === 'creator') {
          router.push(`/${locale}/dashboard/creator`);
        } else {
          router.push(`/${locale}/dashboard`);
        }
        return;
      }

      // Redirect from generic /dashboard to role-specific dashboard
      if (pathname.endsWith('/dashboard')) {
        if (user.role === 'creator') {
          router.push(`/${locale}/dashboard/creator`);
        } else if (user.role === 'brand') {
          router.push(`/${locale}/dashboard/brand`);
        }
        return;
      }
    }
  }, [loading, user, router, pathname, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-burgundy mx-auto mb-4"></div>
          <p className="text-gray-600">{t('message')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
