"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/app/components/ui/spinner';

// Import brand components
import BrandProfileSidebar from '@/app/components/brand/profile-sidebar';
import BrowseCreators from '@/app/components/brand/browse-creators';
import BrandMessages from '@/app/components/brand/messages';
import BrandBookings from '@/app/components/brand/bookings';

export default function BrandDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [profile, setProfile] = useState<DocumentData | null>(null);

  // Tab logic with performance optimization
  const tabNames = ['browse-creators', 'messages', 'bookings'];
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Initialize tab from URL only once
  useEffect(() => {
    const tabParam = searchParams.get('tab') ?? '';
    if (!tabParam || tabParam === 'browse-creators') {
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
      window.history.replaceState(null, '', `/dashboard/brand?tab=${newTab}`);
    }
  }, [tabNames]);

  useEffect(() => {
    if (user && user.role !== 'brand') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const checkBrandProfile = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.brandName) {
            setHasProfile(true);
            setProfile(userData);
            setLoading(false);
          } else {
            router.push('/dashboard/brand/profile-setup');
          }
        } else {
          router.push('/dashboard/brand/profile-setup');
        }
      } catch (error) {
        console.error('Error checking brand profile:', error);
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          setHasProfile(true);
          setLoading(false);
        } else {
          router.push('/dashboard/brand/profile-setup');
        }
      }
    };
    
    checkBrandProfile();
  }, [user, router]);

  // Memoized components to prevent unnecessary re-renders
  const BrowseCreatorsComponent = useMemo(() => <BrowseCreators />, []);
  const MessagesComponent = useMemo(() => <BrandMessages />, []);
  const BookingsComponent = useMemo(() => <BrandBookings />, []);

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
        {/* Mobile-only profile summary */}
        <BrandProfileSidebar 
          profile={profile} 
          isMobile={true} 
          onTabChange={handleTabChange}
          activeTabIndex={selectedIndex}
        />
        
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
} // review trigger
