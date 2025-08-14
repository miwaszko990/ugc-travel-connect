"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/app/components/ui/spinner';
import { useLocale } from 'next-intl';

// Lazy load brand components for better performance
import BrandProfileSidebar from '@/app/components/brand/profile-sidebar';
import dynamic from 'next/dynamic';

const BrowseCreators = dynamic(() => import('@/app/components/brand/browse-creators'), {
  loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-burgundy"></div></div>
});

const BrandMessages = dynamic(() => import('@/app/components/brand/messages'), {
  loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-burgundy"></div></div>
});

const BrandBookings = dynamic(() => import('@/app/components/brand/bookings'), {
  loading: () => <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-burgundy"></div></div>
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
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tab logic with performance optimization
  const [selectedIndex, setSelectedIndex] = useState(DEFAULT_TAB_INDEX);

  // Initialize tab from URL and respond to URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') ?? '';
    if (!tabParam || tabParam === BRAND_TABS[0]) {
      setSelectedIndex(DEFAULT_TAB_INDEX);
    } else {
      const idx = BRAND_TABS.indexOf(tabParam as BrandTab);
      setSelectedIndex(idx >= 0 ? idx : DEFAULT_TAB_INDEX);
    }
  }, [searchParams]); // Listen to URL parameter changes

  // Fast tab switching callback
  const handleTabChange = useCallback((tabIndex: number) => {
    if (tabIndex < 0 || tabIndex >= BRAND_TABS.length) return;
    
    setSelectedIndex(tabIndex);
    
    // Update URL without triggering navigation
    const newTab = BRAND_TABS[tabIndex];
    if (newTab && typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname.split('/').slice(0,2).join('/')}/dashboard/brand?tab=${newTab}`);
    }
  }, []);

  // Role-based access control
  useEffect(() => {
    if (user && user.role !== 'brand') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // Profile verification and setup
  useEffect(() => {
    const checkBrandProfile = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Check for cached profile data first (from recent profile creation)
        const cachedProfile = sessionStorage.getItem('brandProfile');
        const profileComplete = sessionStorage.getItem('profileComplete');
        
        if (cachedProfile && profileComplete === 'true') {
          console.log('✅ Using cached brand profile data for faster loading');
          const profileData = JSON.parse(cachedProfile);
          setHasProfile(true);
          setProfile(profileData);
          setLoading(false);
          // Clear cache after use to prevent stale data
          sessionStorage.removeItem('brandProfile');
          return;
        }
        
        // Fallback to database fetch if no cache
        console.log('📦 Fetching brand profile from database');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as BrandProfile;
          
          // Check if brand profile is complete
          if (userData.brandName && userData.profileComplete !== false) {
            setHasProfile(true);
            setProfile(userData);
          } else {
            // Redirect to profile setup if incomplete
            router.push(`/${locale}/dashboard/brand/profile-setup`);
            return;
          }
        } else {
          // No user document - redirect to setup
          router.push(`/${locale}/dashboard/brand/profile-setup`);
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
          router.push(`/${locale}/dashboard/brand/profile-setup`);
          return;
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkBrandProfile();
  }, [user, router, locale]);

  // Memoized components to prevent unnecessary re-renders
  const BrowseCreatorsComponent = useMemo(() => <BrowseCreators />, []);
  const MessagesComponent = useMemo(() => <BrandMessages />, []);
  const BookingsComponent = useMemo(() => <BrandBookings />, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
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
    );
  }

  // Profile not complete - will redirect
  if (!hasProfile) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#FDFCF9'}}>
      {/* Sophisticated Background Pattern - matching creator dashboard */}
      <div className="absolute inset-0">
        {/* Subtle dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 0, 0, 0.4) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
        
        {/* Elegant gradient overlays */}
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-red-burgundy/2 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-1/5 h-1/5 bg-gradient-to-bl from-red-burgundy/1 to-transparent rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex">
        {/* Mobile-only profile summary - HIDDEN */}
        {/* <BrandProfileSidebar 
          profile={profile} 
          isMobile={true} 
          onTabChange={handleTabChange}
          activeTabIndex={selectedIndex}
        /> */}
        
        {/* Left sidebar */}
        <BrandProfileSidebar 
          profile={profile} 
          onTabChange={handleTabChange}
          activeTabIndex={selectedIndex}
        />
        
        {/* Main content area */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto">
            {/* Main content - Components stay mounted for better performance */}
            <div className="min-h-screen">
              <div style={{ display: selectedIndex === 0 ? 'block' : 'none' }}>
                {BrowseCreatorsComponent}
              </div>
              <div style={{ display: selectedIndex === 1 ? 'block' : 'none' }}>
                {MessagesComponent}
              </div>
              <div style={{ display: selectedIndex === 2 ? 'block' : 'none' }}>
                {BookingsComponent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
