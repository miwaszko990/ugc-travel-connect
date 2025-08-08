"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/app/components/ui/spinner';
import dynamic from 'next/dynamic';

// Optimize for Vercel Edge Runtime
export const runtime = 'edge'
export const preferredRegion = 'auto'

// Lazy load heavy components with optimized loading states
const BrandProfileSidebar = dynamic(() => 
  import('@/app/components/brand/profile-sidebar'), {
  ssr: true, // Enable SSR for sidebar since it's critical for layout
  loading: () => (
    <div className="hidden md:flex w-80 h-screen bg-white border-r border-gray-100">
      <div className="w-full p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-gray-200 rounded-xl"></div>
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
});

// Heavy components lazy loaded with priority based on user interaction
const BrowseCreators = dynamic(() => 
  import('@/app/components/brand/browse-creators'), {
  ssr: false, // SSR disabled for heavy interactive component
  loading: () => (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 animate-pulse">
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
});

const BrandMessages = dynamic(() => 
  import('@/app/components/brand/messages'), {
  ssr: false, // Messages require real-time functionality
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#FDFCF9'}}>
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-red-burgundy/10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-burgundy mx-auto"></div>
        <p className="text-red-burgundy font-serif mt-4 text-center">Loading conversations...</p>
      </div>
    </div>
  )
});

const BrandBookings = dynamic(() => 
  import('@/app/components/brand/bookings'), {
  ssr: false, // Bookings require client-side state management
  loading: () => (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 animate-pulse">
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
});

// Constants for better maintainability
const BRAND_TABS = ['browse-creators', 'messages', 'bookings'] as const;
const DEFAULT_TAB_INDEX = 0;

type BrandTab = typeof BRAND_TABS[number];

interface BrandProfile extends DocumentData {
  brandName?: string;
  profileComplete?: boolean;
}

export default function BrandDashboard() {
  const t = useTranslations('brand.dashboard');
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tab logic with performance optimization
  const [selectedIndex, setSelectedIndex] = useState(DEFAULT_TAB_INDEX);

  // Memoize tab initialization to prevent recalculation
  const initialTabIndex = useMemo(() => {
    const tabParam = searchParams.get('tab') ?? '';
    if (!tabParam || tabParam === BRAND_TABS[0]) {
      return DEFAULT_TAB_INDEX;
    }
    const idx = BRAND_TABS.indexOf(tabParam as BrandTab);
    return idx >= 0 ? idx : DEFAULT_TAB_INDEX;
  }, [searchParams]);

  // Initialize tab from URL only once
  useEffect(() => {
    setSelectedIndex(initialTabIndex);
  }, [initialTabIndex]);

  // Optimized tab switching with bounds checking
  const handleTabChange = useCallback((tabIndex: number) => {
    if (tabIndex < 0 || tabIndex >= BRAND_TABS.length) return;
    
    setSelectedIndex(tabIndex);
    
    // Update URL without triggering navigation
    const newTab = BRAND_TABS[tabIndex];
    if (newTab && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  // Role-based access control with early redirect
  useEffect(() => {
    if (user && user.role !== 'brand') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // Optimized profile verification with better error handling
  const checkBrandProfile = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as BrandProfile;
        
        // Check if brand profile is complete
        if (userData.brandName && userData.profileComplete !== false) {
          setHasProfile(true);
          setProfile(userData);
        } else {
          // Redirect to profile setup if incomplete
          router.push('/dashboard/brand/profile-setup');
          return;
        }
      } else {
        // No user document - redirect to setup
        router.push('/dashboard/brand/profile-setup');
        return;
      }
    } catch (error) {
      console.error('Error checking brand profile:', error);
      setError('Failed to load profile');
      
      // Development fallback
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        setHasProfile(true);
        setProfile({ brandName: 'Test Brand' });
      } else {
        router.push('/dashboard/brand/profile-setup');
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  // Profile verification effect
  useEffect(() => {
    checkBrandProfile();
  }, [checkBrandProfile]);

  // Memoized component rendering based on selected tab for better performance
  const renderTabContent = useMemo(() => {
    switch (selectedIndex) {
      case 0:
        return <BrowseCreators key="browse-creators" />;
      case 1:
        return <BrandMessages key="messages" />;
      case 2:
        return <BrandBookings key="bookings" />;
      default:
        return <BrowseCreators key="browse-creators" />;
    }
  }, [selectedIndex]);

  // Memoized loading component
  const LoadingComponent = useMemo(() => (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    </div>
  ), [t]);

  // Memoized error component
  const ErrorComponent = useMemo(() => (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('error.title')}</h3>
        <p className="text-gray-600 mb-4">{t('error.message')}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-burgundy text-white px-4 py-2 rounded-lg hover:bg-red-burgundy/90 transition-colors"
        >
          {t('error.retry')}
        </button>
      </div>
    </div>
  ), [t]);

  // Early returns for performance
  if (loading) return LoadingComponent;
  if (error) return ErrorComponent;
  if (!hasProfile) return null;

  return (
    <div className="min-h-screen" style={{backgroundColor: '#FDFCF9'}}>
      {/* Optimized background pattern with reduced complexity */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 0, 0, 0.4) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-red-burgundy/2 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-1/5 h-1/5 bg-gradient-to-bl from-red-burgundy/1 to-transparent rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex">
        {/* Mobile-only profile summary with lazy loading */}
        <BrandProfileSidebar 
          profile={profile} 
          isMobile={true} 
          onTabChange={handleTabChange}
          activeTabIndex={selectedIndex}
        />
        
        {/* Left sidebar with lazy loading */}
        <BrandProfileSidebar 
          profile={profile} 
          onTabChange={handleTabChange}
          activeTabIndex={selectedIndex}
        />
        
        {/* Main content area with optimized rendering */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto">
            <div className="min-h-screen">
              {renderTabContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
