"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/app/hooks/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/app/components/ui/spinner';

// Import our components
import ProfileSidebar from '@/app/components/creator/profile-sidebar';
import TravelPlans from '@/app/components/creator/travel-plans 2';
import Messages from '@/app/components/creator/messages';
import Earnings from '@/app/components/creator/earnings';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
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
      window.history.replaceState(null, '', `/dashboard/creator?tab=${newTab}`);
    }
  }, [tabNames]);

  useEffect(() => {
    if (user && user.role !== 'creator') {
      router.replace('/dashboard');
    }
  }, [user, router]);

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
            router.push('/dashboard/creator/profile-setup');
          }
        } else {
          router.push('/dashboard/creator/profile-setup');
        }
      } catch (error) {
        console.error('Error checking creator profile:', error);
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          setHasProfile(true);
          setLoading(false);
        } else {
          router.push('/dashboard/creator/profile-setup');
        }
      }
    };
    
    checkCreatorProfile();
  }, [user, router]);

  // Memoized components to prevent unnecessary re-renders
  const TravelPlansComponent = useMemo(() => 
    <TravelPlans />, 
    []
  );
  
  const MessagesComponent = useMemo(() => <Messages />, []);
  const EarningsComponent = useMemo(() => <Earnings />, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <Spinner size="lg" />
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
        {/* Mobile-only profile summary */}
        <ProfileSidebar 
          profile={profile} 
          isMobile={true} 
          onTabChange={handleTabChange}
          activeTabIndex={selectedIndex}
        />
        
        {/* Left sidebar */}
        <ProfileSidebar 
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
                {TravelPlansComponent}
              </div>
              <div style={{ display: selectedIndex === 1 ? 'block' : 'none' }}>
                {MessagesComponent}
              </div>
              <div style={{ display: selectedIndex === 2 ? 'block' : 'none' }}>
                {EarningsComponent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
// review trigger
