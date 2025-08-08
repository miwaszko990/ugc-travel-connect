'use client';

import { useAuth } from '@/app/hooks/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!loading && user) {
      // Role-based route protection
      if (pathname.startsWith('/dashboard/creator') && user.role !== 'creator') {
        // Brand trying to access creator dashboard
        if (user.role === 'brand') {
          router.push('/dashboard/brand');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      if (pathname.startsWith('/dashboard/brand') && user.role !== 'brand') {
        // Creator trying to access brand dashboard
        if (user.role === 'creator') {
          router.push('/dashboard/creator');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      // Redirect from generic /dashboard to role-specific dashboard
      if (pathname === '/dashboard') {
        if (user.role === 'creator') {
          router.push('/dashboard/creator');
        } else if (user.role === 'brand') {
          router.push('/dashboard/brand');
        }
        return;
      }
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-burgundy border-r-transparent mx-auto"></div>
          <div className="mt-6">
            <h3 className="text-2xl font-serif font-semibold text-red-burgundy mb-2">Lumo</h3>
            <p className="text-lg text-subtext">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-burgundy border-r-transparent mx-auto"></div>
          <div className="mt-6">
            <h3 className="text-2xl font-serif font-semibold text-red-burgundy mb-2">Lumo</h3>
            <p className="text-lg text-subtext">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} // review trigger
