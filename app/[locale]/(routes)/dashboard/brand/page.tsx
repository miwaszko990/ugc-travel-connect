"use client";

import { useEffect, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/app/components/ui/spinner';
import { NavigationIcons } from '@/app/lib/navigation-config';

// Import our components
import BrowseCreators from '@/app/components/brand/browse-creators';
import BrandMessages from '@/app/components/brand/messages';
import BrandBookings from '@/app/components/brand/bookings';
import BrandJobs from '@/app/components/brand/jobs';


// Mobile navigation items - stable icons

// Tab management
type BrandTab = 'browse' | 'messages' | 'bookings' | 'jobs';
const BRAND_TABS: BrandTab[] = ['browse', 'messages', 'bookings', 'jobs'];
const DEFAULT_TAB_INDEX = 0;

interface BrandProfile extends DocumentData {
  uid?: string;
  brandName?: string;
  profileComplete?: boolean;
}

// Mobile Bottom Navigation Component
function MobileBottomNavigation({ 
  selectedIndex, 
  onTabChange,
  locale 
}: { 
  selectedIndex: number; 
  onTabChange: (index: number) => void;
  locale: string; 
}) {
  const tNav = useTranslations('brand.navigation');
  
  // Enhanced tab configuration with Home and Profile
  const tabs = [
    { 
      key: 'home', 
      icon: NavigationIcons.home, 
      index: -1, // Special index for home
      action: () => window.location.href = `/${locale}` 
    },
    { key: 'browse', icon: NavigationIcons.search, index: 0 },
    { key: 'messages', icon: NavigationIcons.messages, index: 1 },
    { key: 'bookings', icon: NavigationIcons.bookings, index: 2 },
    { key: 'jobs', icon: NavigationIcons.briefcase, index: 3 },
    { 
      key: 'profile', 
      icon: NavigationIcons.edit, 
      index: -2, // Special index for profile
      action: () => window.location.href = `/${locale}/dashboard/brand/profile-setup` 
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center h-16 sm:hidden shadow-lg">
      {tabs.map((tab) => {
        const isActive = selectedIndex === tab.index;
        return (
          <button
            key={tab.key}
            onClick={() => tab.action ? tab.action() : onTabChange(tab.index)}
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
            <span className="font-serif">{tNav(tab.key)}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function BrandDashboard() {
  const t = useTranslations('brand.dashboard');
  const tNav = useTranslations('brand.navigation');
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

  // Initialize tab from URL only once
  useEffect(() => {
    const tabParam = searchParams.get('tab') ?? '';
    if (!tabParam || tabParam === BRAND_TABS[0]) {
      setSelectedIndex(DEFAULT_TAB_INDEX);
    } else {
      const idx = BRAND_TABS.indexOf(tabParam as BrandTab);
      setSelectedIndex(idx >= 0 ? idx : DEFAULT_TAB_INDEX);
    }
  }, []); // Remove searchParams dependency to prevent infinite loops

  // Fast tab switching callback
  const handleTabChange = useCallback((tabIndex: number) => {
    if (tabIndex < 0 || tabIndex >= BRAND_TABS.length) return;
    
    setSelectedIndex(tabIndex);
    
    // Update URL without triggering navigation (clear chatId to prevent auto-opening conversations)
    const newTab = BRAND_TABS[tabIndex];
    if (newTab && typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/${locale}/dashboard/brand?tab=${newTab}`);
    }
  }, [locale]);

  // Role-based access control
  useEffect(() => {
    if (user && user.role !== 'brand') {
      router.replace(`/${locale}/dashboard`);
      return;
    }
  }, [user, router, locale]);

  // Fetch brand profile
  useEffect(() => {
    const fetchBrandProfile = async () => {
      if (!user?.uid) {
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = { uid: user.uid, ...docSnap.data() } as BrandProfile;
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
  }, [user?.uid]); // Only depend on user.uid, not the entire user object

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

  // Temporary: Removed useMemo to fix infinite loop
  const BrowseCreatorsComponent = <BrowseCreators />;
  const MessagesComponent = <BrandMessages />;
  const BookingsComponent = <BrandBookings />;
  const JobsComponent = <BrandJobs />; 

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

      <div className="relative z-10 flex flex-col">
        {/* Dashboard Navigation Bar - Desktop only */}
        <div className="hidden sm:block sticky top-0 z-20" style={{ 
          backgroundColor: 'rgba(253, 252, 249, 0.95)', 
          backdropFilter: 'blur(20px)',
          boxShadow: '0 1px 3px rgba(139, 0, 0, 0.1)'
        }}>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-40"></div>
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo Section */}
              <div className="flex items-center">
                <button 
                  onClick={() => window.location.href = `/${locale}`}
                  className="flex items-center group"
                >
                  <div className="relative">
                    <span className="text-3xl font-serif font-bold text-red-burgundy group-hover:text-red-wine transition-all duration-300 transform group-hover:scale-105">
                      Lumo
                    </span>
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-burgundy group-hover:w-full transition-all duration-300"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-600 hidden lg:block tracking-wide uppercase">
                    Travel Connect
                  </span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex items-center space-x-8">
                {[
                  { key: 'browse', icon: NavigationIcons.search, index: 0 },
                  { key: 'messages', icon: NavigationIcons.messages, index: 1 },
                  { key: 'bookings', icon: NavigationIcons.bookings, index: 2 },
                  { key: 'jobs', icon: NavigationIcons.briefcase, index: 3 }
                ].map((tab) => {
                  const isActive = selectedIndex === tab.index;
                  return (
                    <button
                      key={tab.index}
                      onClick={() => handleTabChange(tab.index)}
                      className={`relative flex items-center gap-3 px-4 py-3 font-medium transition-all duration-300 group rounded-xl ${
                        isActive 
                          ? 'text-red-burgundy bg-red-burgundy/10 shadow-sm' 
                          : 'text-gray-600 hover:text-red-burgundy hover:bg-red-burgundy/5'
                      }`}
                    >
                      <tab.icon className={`w-5 h-5 transition-colors duration-300 ${
                        isActive ? 'text-red-burgundy' : 'text-gray-500 group-hover:text-red-burgundy'
                      }`} />
                      <span className="font-serif text-sm">{tNav(tab.key)}</span>
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-red-burgundy rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Profile Section */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.location.href = `/${locale}/dashboard/brand/profile-setup`}
                  className="text-right hover:bg-red-burgundy/5 px-3 py-2 rounded-lg transition-all duration-300 group"
                >
                  <div className="text-sm font-medium text-gray-900 truncate max-w-32 group-hover:text-red-burgundy transition-colors duration-300">
                    {profile?.brandName || 'Brand Dashboard'}
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-red-burgundy/70 transition-colors duration-300">
                    Brand Account
                  </div>
                </button>
                
                {/* Help Button */}
                <a
                  href="mailto:hello@lumocreators.com"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-burgundy hover:bg-red-burgundy/5 rounded-lg transition-all duration-300"
                  title="Pomoc"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                  <span className="hidden xl:inline">Pomoc</span>
                </a>
                
                {/* Logout Button */}
                <button
                  onClick={async () => {
                    if (confirm('Czy na pewno chcesz się wylogować?')) {
                      const { logout } = await import('@/app/hooks/auth');
                      const { signOut } = await import('firebase/auth');
                      const { auth } = await import('@/app/lib/firebase');
                      await signOut(auth);
                      window.location.href = `/${locale}`;
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-burgundy hover:bg-red-burgundy/5 rounded-lg transition-all duration-300"
                  title="Wyloguj się"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  <span className="hidden xl:inline">Wyloguj</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area - mobile optimized */}
        <div className="flex-1">
          <div className="w-full">
            {/* Mobile Header with Help button - visible only on mobile */}
            <div className="sm:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-serif font-bold text-gray-900">
                  {profile?.brandName || 'Dashboard'}
                </h1>
                <a
                  href="mailto:hello@lumocreators.com"
                  className="flex items-center gap-1 px-3 py-2 text-xs text-gray-600 hover:text-red-burgundy hover:bg-red-burgundy/5 rounded-lg transition-all duration-300 border border-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                  <span>Pomoc</span>
                </a>
              </div>
            </div>

            {/* Main content - Mobile responsive */}
            <div className="min-h-screen pb-20 sm:pb-0">
              {/* Messages - Full width without padding */}
              <div style={{ display: selectedIndex === 1 ? 'block' : 'none' }} className="h-full">
                {MessagesComponent}
              </div>
              
              {/* Other content with padding */}
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div style={{ display: selectedIndex === 0 ? 'block' : 'none' }}>
                  {BrowseCreatorsComponent}
                </div>
                <div style={{ display: selectedIndex === 2 ? 'block' : 'none' }}>
                  {BookingsComponent}
                </div>
                <div style={{ display: selectedIndex === 3 ? 'block' : 'none' }}>
                  {JobsComponent}
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
        locale={locale}
      />
    </div>
  );
}
