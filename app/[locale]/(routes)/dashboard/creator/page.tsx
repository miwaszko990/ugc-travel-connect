"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/app/components/ui/spinner';
import { useLocale } from 'next-intl';

// Import our components
import TravelPlans from '@/app/components/creator/travel-plans';
import CreatorMessages from '@/app/components/creator/messages';
import CreatorEarnings from '@/app/components/creator/earnings';
import CreatorProfileSidebar from '@/app/components/creator/profile-sidebar';

// Mobile navigation items - stable icons
import { NavigationIcons } from '@/app/lib/navigation-config';

interface CreatorProfile extends DocumentData {
  uid?: string;
  firstName?: string;
  profileComplete?: boolean;
}

// Mobile Bottom Navigation Component
function MobileBottomNavigation({ selectedIndex, onTabChange }: { selectedIndex: number; onTabChange: (index: number) => void; }) {
  // Stable tab configuration - fixed tab names to prevent re-renders
  const tabs = [
    { name: 'Travels', icon: NavigationIcons.travel, index: 0 },
    { name: 'Messages', icon: NavigationIcons.messages, index: 1 },
    { name: 'Earnings', icon: NavigationIcons.earnings, index: 2 }
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

export default function CreatorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('creator.dashboard');
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

      <div className="relative z-10 flex">
        {/* Left sidebar - hidden on mobile */}
        <div className="hidden sm:block">
          <CreatorProfileSidebar 
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
      />
    </div>
  );
} 
// review trigger
