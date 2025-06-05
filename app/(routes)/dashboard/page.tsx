'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/app/components/ui/spinner';

/**
 * This dashboard page serves as a router for creators and a landing page for brands
 * since the brand dashboard is being rebuilt
 */
export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // For creators, redirect to their specific dashboard
    if (!loading && user && user.role === 'creator') {
      router.push('/dashboard/creator');
    } else if (!loading && !user) {
      // If not authenticated, redirect to login
      router.push('/auth/login');
    }
    // For brands, we'll render the placeholder below
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" />
          <h2 className="mt-4 text-xl">Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  if (user && user.role === 'brand') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Brand Dashboard</h1>
          <p>This page will be rebuilt from scratch.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <Spinner size="lg" />
        <h2 className="mt-4 text-xl">Redirecting...</h2>
      </div>
    </div>
  );
} 