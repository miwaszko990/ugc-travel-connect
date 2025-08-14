"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/app/components/ui/spinner';
import { useLocale } from 'next-intl';
import { NavigationIcons } from '@/app/lib/navigation-config';

// Import our components
import TravelPlans from '@/app/components/creator/travel-plans';
import CreatorMessages from '@/app/components/creator/messages';
import CreatorEarnings from '@/app/components/creator/earnings';


// Mobile navigation items - stable icons

interface CreatorProfile extends DocumentData {
  uid?: string;
  firstName?: string;
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
  const tNav = useTranslations('creator.navigation');
  
  // Enhanced tab configuration with Home and Profile
  const tabs = [
    { 
      key: 'home', 
      icon: NavigationIcons.home, 
      index: -1, // Special index for home
      action: () => window.location.href = `/${locale}` 
    },
    { key: 'travels', icon: NavigationIcons.travel, index: 0 },
    { key: 'messages', icon: NavigationIcons.messages, index: 1 },
    { key: 'earnings', icon: NavigationIcons.earnings, index: 2 },
    { 
      key: 'profile', 
      icon: NavigationIcons.edit, 
      index: -2, // Special index for profile
      action: () => window.location.href = `/${locale}/dashboard/creator/profile/settings` 
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

export default function CreatorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('creator.dashboard');
  const tNav = useTranslations('creator.navigation');
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [profile, setProfile] = useState<DocumentData | null>(null);

  // Tab logic with performance optimization
  const tabNames = ['travel-plans', 'messages', 'earnings'];
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Initialize tab from URL only once
  useEffect(() => {
    const tabParam = searchParams.get('tab') ?? '';
    if (!tabParam || tabParam === 'travel-plans') {
      setSelectedIndex(0);
    } else {
      const idx = tabNames.indexOf(tabParam);
      setSelectedIndex(idx >= 0 ? idx : 0);
    }
  }, []); // Remove searchParams dependency to prevent unnecessary re-runs

  // Fast tab switching callback
  const handleTabChange = useCallback((tabIndex: number) => {
    setSelectedIndex(tabIndex);
    
    // Update URL without triggering navigation (optional)
    const newTab = tabNames[tabIndex];
    if (newTab) {
      window.history.replaceState(null, '', `/${locale}/dashboard/creator?tab=${newTab}`);
    }
  }, [tabNames, locale]);

  useEffect(() => {
    if (user && user.role !== 'creator') {
      router.replace(`/${locale}/dashboard`);
    }
  }, [user, router, locale]);

  useEffect(() => {
    const checkCreatorProfile = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.firstName) {
            setHasProfile(true);
            setProfile(userData);
            setLoading(false);
          } else {
            router.push(`/${locale}/dashboard/creator/profile-setup`);
          }
        } else {
          router.push(`/${locale}/dashboard/creator/profile-setup`);
        }
      } catch (error) {
        console.error('Error checking creator profile:', error);
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          setHasProfile(true);
          setLoading(false);
        } else {
          router.push(`/${locale}/dashboard/creator/profile-setup`);
        }
      }
    };
    
    checkCreatorProfile();
  }, [user, router, locale]);

  // Memoized components to prevent unnecessary re-renders
  const TravelPlansComponent = useMemo(() => 
    <TravelPlans />, 
    []
  );
  
  const MessagesComponent = useMemo(() => <CreatorMessages />, []);
  const EarningsComponent = useMemo(() => <CreatorEarnings />, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600 font-inter">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#FDFCF9'}}>
      {/* Sophisticated Background Pattern - matching hero section */}
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
                  { key: 'travels', icon: NavigationIcons.travel, index: 0 },
                  { key: 'messages', icon: NavigationIcons.messages, index: 1 },
                  { key: 'earnings', icon: NavigationIcons.earnings, index: 2 }
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
              <div className="flex items-center">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {profile?.firstName ? `${profile.firstName}` : 'Creator Dashboard'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Creator Account
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area - mobile optimized */}
        <div className="flex-1">
          <div className="w-full">
            {/* Main content - Mobile responsive */}
            <div className="min-h-screen pb-20 sm:pb-0">
              {/* Messages - Full width without padding */}
              <div style={{ display: selectedIndex === 1 ? 'block' : 'none' }} className="h-full">
                {MessagesComponent}
              </div>
              
              {/* Other content with padding */}
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div style={{ display: selectedIndex === 0 ? 'block' : 'none' }}>
                  {TravelPlansComponent}
                </div>
                <div style={{ display: selectedIndex === 2 ? 'block' : 'none' }}>
                  {EarningsComponent}
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
// review trigger
