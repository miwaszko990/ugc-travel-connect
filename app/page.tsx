"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '@/app/hooks/auth';
import CreatorCard from '@/app/components/creator/creator-card';
import HeroSection from '@/app/components/ui/hero-section';
import Navigation from '@/app/components/ui/navigation';
import Footer from '@/app/components/ui/footer';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Link from 'next/link';

interface Creator {
  uid: string;
  firstName: string;
  lastName: string;
  homeCity: string;
  profileImageUrl: string;
  upcomingTrip?: {
    destination: string;
    country: string;
    dateRange: string;
  };
  followers?: number;
}

// Dynamic imports for heavy components
const AuthRequiredModalDynamic = dynamic(() => import('@/app/components/ui/auth-required-modal'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-neutral-100 rounded-2xl h-96"></div>
});

export default function Home() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (user) {
      // console.log('Current user:', user);
    }
  }, [user]);

  useEffect(() => {
    async function fetchCreators() {
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('role', '==', 'creator'),
          orderBy('createdAt', 'desc'),
          limit(12)
        );

        const querySnapshot = await getDocs(q);
        const creatorsList: Creator[] = [];

        for (const doc of querySnapshot.docs) {
          const userData = doc.data();
          if (!userData.firstName || !userData.lastName) continue;
          const creator: Creator = {
            uid: doc.id,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            homeCity: userData.homeCity || 'Unknown Location',
            profileImageUrl: userData.profileImageUrl || '/placeholder-profile.jpg',
            followers: userData.followerCount || userData.followers || Math.floor(Math.random() * 50000) + 5000,
          };
          try {
            const travelPlansRef = collection(db, 'users', doc.id, 'travelPlans');
            const tripsQuery = query(
              travelPlansRef,
              where('startDate', '>', new Date()),
              orderBy('startDate', 'asc'),
              limit(1)
            );
            const tripsSnapshot = await getDocs(tripsQuery);
            if (!tripsSnapshot.empty) {
              const tripData = tripsSnapshot.docs[0].data();
              const startDate = tripData.startDate.toDate();
              const endDate = tripData.endDate.toDate();
              const dateRange = formatDateRange(startDate, endDate);
              creator.upcomingTrip = {
                destination: tripData.destination,
                country: tripData.country,
                dateRange
              };
            }
          } catch (error) {
            // continue without trip data
          }
          creatorsList.push(creator);
        }
        setCreators(creatorsList);
      } catch (error) {
        // error fetching creators
      } finally {
        setLoading(false);
      }
    }
    fetchCreators();
  }, []);

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const startMonth = startDate.toLocaleString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endMonth = endDate.toLocaleString('en-US', { month: 'short' });
    const endDay = endDate.getDate();
    const year = endDate.getFullYear();
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
  };

  const handleCreatorClick = (creator: Creator) => {
    if (user) {
      router.push(`/creator/${creator.uid}`);
    } else {
      setSelectedCreator(creator);
      setShowAuthModal(true);
    }
  };

  const handleSearch = (filters: { location: string; dates: string }) => {
    console.log('Searching with filters:', filters);
    // TODO: Implement search functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-burgundy border-r-transparent mx-auto"></div>
          <div className="mt-6">
            <h3 className="text-2xl font-display font-semibold text-red-burgundy mb-2">Lumo</h3>
            <p className="text-lg text-subtext">Discovering amazing creators...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navigation sticky={true} />
      <HeroSection />
      
      <section id="creators-grid" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-red-burgundy mb-6">
              Featured Creators
            </h2>
            <p className="text-xl text-subtext max-w-3xl mx-auto">
              Discover our handpicked selection of luxury travel creators who bring destinations to life through authentic storytelling and premium content.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {creators.length > 0 ? (
              creators.map((creator) => (
                <CreatorCard 
                  key={creator.uid}
                  creator={creator}
                  onClick={handleCreatorClick}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-subtext text-lg">No creators found. Please try again later.</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-16">
            <Link href="/search">
              <button className="group relative inline-flex items-center gap-3 bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-red-burgundy">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-burgundy/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative">View All Creators</span>
                <svg className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      <Suspense fallback={null}>
        <AuthRequiredModalDynamic 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          creatorName={selectedCreator ? `${selectedCreator.firstName} ${selectedCreator.lastName}` : undefined}
        />
      </Suspense>
      
      <Footer />
    </div>
  );
}
// review trigger
