"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/app/components/ui/spinner';

// Import our components
import BrowseCreators from '@/app/components/brand/browse-creators';
import BrandMessages from '@/app/components/brand/messages';
import BrandBookings from '@/app/components/brand/bookings';
import BrandProfileSidebar from '@/app/components/brand/profile-sidebar';

// Mobile navigation items
import { BRAND_MOBILE_NAV_ITEMS } from '@/app/lib/navigation-config';

// Tab management
type BrandTab = 'browse' | 'messages' | 'bookings';
const BRAND_TABS: BrandTab[] = ['browse', 'messages', 'bookings'];
const DEFAULT_TAB_INDEX = 0;

interface BrandProfile extends DocumentData {
  uid?: string;
  brandName?: string;
  profileComplete?: boolean;
}

// Mobile Bottom Navigation Component
function MobileBottomNavigation({ 
  selectedIndex, 
  onTabChange 
}: { 
  selectedIndex: number; 
  onTabChange: (index: number) => void; 
}) {
  const t = useTranslations('brand.navigation');
  
  const tabs = [
    { name: t('browse'), icon: BRAND_MOBILE_NAV_ITEMS[1].icon, index: 0 },
    { name: t('messages'), icon: BRAND_MOBILE_NAV_ITEMS[2].icon, index: 1 },
    { name: t('bookings'), icon: BRAND_MOBILE_NAV_ITEMS[3].icon, index: 2 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center h-16 sm:hidden shadow-lg">
      {tabs.map((tab) => {
        const isActive = selectedIndex === tab.index;
        return (
          <button
            key={tab.index}
            onClick={() => onTabChange(tab.index)}
            className={`flex flex-col items-center justify-center flex-1 h-full text-xs font-medium transition-all duration-300 ${
              isActive 
                ? 'text-white bg-gradient-to-t from-red-burgundy to-red-burgundy/90' 
                : 'text-gray-500 hover:text-red-burgundy hover:bg-red-burgundy/5'
            }`}
          >
            <tab.icon
              className={`w-6 h-6 mb-1 transition-colors duration-300 ${
                isActive ? 'text-white' : 'text-gray-400'
              }`}
            />
            <span className="font-serif">{tab.name}</span>
          </button>
        );
      })}
    </nav>
  );
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

  // Debug logging
  useEffect(() => {
    console.log('🔍 Brand Dashboard Debug - User:', user);
    console.log('🔍 Brand Dashboard Debug - User Role:', user?.role);
    console.log('🔍 Brand Dashboard Debug - User UID:', user?.uid);
    console.log('🔍 Brand Dashboard Debug - Loading:', loading);
  }, [user, loading]);

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
    console.log('🔍 Role Check - User:', user, 'Role:', user?.role);
    if (user && user.role !== 'brand') {
      console.log('⚠️ User role is not brand, redirecting...', user.role);
      router.replace('/dashboard');
      return;
    }
  }, [user, router]);

  // Fetch brand profile
  useEffect(() => {
    const fetchBrandProfile = async () => {
      if (!user?.uid) {
        console.log('⚠️ No user UID available');
        return;
      }

      try {
        console.log('🔍 Fetching brand profile for UID:', user.uid);
        setLoading(true);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = { uid: user.uid, ...docSnap.data() } as BrandProfile;
          console.log('✅ Brand profile found:', userData);
          setProfile(userData);
          setHasProfile(true);
        } else {
          console.warn('⚠️ No brand profile document found for UID:', user.uid);
          setHasProfile(false);
        }
      } catch (error) {
        console.error('❌ Error fetching brand profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandProfile();
  }, [user]);

  // Show loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-burgundy text-white rounded hover:bg-red-wine"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  // Memoized components to prevent unnecessary re-renders
  const BrowseCreatorsComponent = useMemo(() => <BrowseCreators />, []);
  const MessagesComponent = useMemo(() => <BrandMessages />, []);
  const BookingsComponent = useMemo(() => <BrandBookings />, []); 

  return (
    <div className="min-h-screen" style={{backgroundColor: '#FDFCF9'}}>
      {/* Sophisticated Background Pattern */}
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
        {/* Left sidebar - hidden on mobile */}
        <div className="hidden sm:block">
          <BrandProfileSidebar 
            profile={profile} 
            onTabChange={handleTabChange}
            activeTabIndex={selectedIndex}
          />
        </div>
        
        {/* Main content area - mobile optimized */}
        <div className="flex-1 sm:ml-0">
          <div className="w-full">
            {/* Main content - Mobile responsive */}
            <div className="min-h-screen pb-20 sm:pb-0">
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation 
        selectedIndex={selectedIndex} 
        onTabChange={handleTabChange} 
      />
    </div>
  );
}
