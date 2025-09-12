'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { doc, getDoc, collection, query, /* where, */ getDocs, orderBy, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/auth';
import NewMessageModal from '@/app/components/messages/new-message-modal';
import AuthRequiredModal from '@/app/components/ui/auth-required-modal';
import Navigation from '@/app/components/ui/navigation';
import { MapPinIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon, LinkIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import CreatorPackages from '@/app/components/creator/CreatorPackages';

// Import framer-motion normally but conditionally render
import { motion, AnimatePresence } from 'framer-motion';

interface TravelPlan {
  id: string;
  destination: string;
  country: string;
  startDate: Date;
  endDate: Date;
  dateRange: string;
  status: 'Planned' | 'Active' | 'Completed';
}

interface CreatorProfile {
  uid: string;
  firstName: string;
  lastName: string;
  homeCity: string;
  instagramHandle: string;
  followerCount: number;
  profileImageUrl: string;
  travelPlans: TravelPlan[];
}

export default function ClientCreatorProfile({ uid }: { uid: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('creator.profilePage');
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [creatorPackages, setCreatorPackages] = useState<any[]>([]);
  const [prefilledMessage, setPrefilledMessage] = useState<string>("");
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    async function fetchCreatorProfile() {
      try {
        setLoading(true);
        
        // Batch the Firestore operations for better performance
        const [creatorDoc, tripsSnapshot] = await Promise.all([
          getDoc(doc(db, 'users', uid)),
          getDocs(query(
            collection(db, 'users', uid, 'travelPlans'),
            orderBy('startDate', 'asc'),
            limit(5)
          ))
        ]);
        
        if (!creatorDoc.exists()) {
          setError('Creator not found');
          return;
        }

        const creatorData = creatorDoc.data();
        
        // Check if this is actually a creator
        if (creatorData.role !== 'creator') {
          setError('Not a valid creator profile');
          return;
        }

        // Process travel plans
        const travelPlans: TravelPlan[] = [];
        tripsSnapshot.forEach(doc => {
          const data = doc.data();
          
          // Convert Firestore timestamps to JS Date objects
          const startDate = data.startDate.toDate();
          const endDate = data.endDate.toDate();
          
          travelPlans.push({
            id: doc.id,
            destination: data.destination || '',
            country: data.country || '',
            startDate,
            endDate,
            dateRange: formatDateRange(startDate, endDate),
            status: data.status || 'Planned'
          });
        });

        // Fetch creator packages
        const servicePackages = creatorData.servicePackages || [];
        console.log('📦 Fetched creator packages for modal:', servicePackages);
        setCreatorPackages(servicePackages);

        // Create creator profile object
        const profile: CreatorProfile = {
          uid,
          firstName: creatorData.firstName || '',
          lastName: creatorData.lastName || '',
          homeCity: creatorData.homeCity || 'Unknown Location',
          instagramHandle: creatorData.instagramHandle || '',
          followerCount: creatorData.followerCount || 0,
          profileImageUrl: creatorData.profileImageUrl || '/placeholder-profile.jpg',
          travelPlans
        };

        setCreator(profile);
      } catch (err) {
        console.error('Error fetching creator profile:', err);
        setError('Failed to load creator profile');
      } finally {
        setLoading(false);
      }
    }

    fetchCreatorProfile();
  }, [uid]);



  // Check authentication when component mounts
  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [user, loading]);

  // Format dates in "Month Day – Month Day, Year" format
  const formatDateRange = (startDate: Date, endDate: Date) => {
    const startMonth = startDate.toLocaleString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endMonth = endDate.toLocaleString('en-US', { month: 'short' });
    const endDay = endDate.getDate();
    const year = endDate.getFullYear();

    // If same month, don't repeat month name
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}, ${year}`;
    }
    
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
  };

  // Helper to get all date ranges for trips - Memoized for performance
  const getTripDateRanges = useMemo(() => {
    return creator?.travelPlans.map(trip => ({
      start: trip.startDate,
      end: trip.endDate,
      destination: trip.destination,
      color: '#8B0000',
    })) || [];
  }, [creator?.travelPlans]);

  // Memoize the formatted message for performance
  const prefilledCollaborationMessage = useMemo(() => {
    if (!creator) return '';
    return `Hi ${creator.firstName}! I'm interested in collaborating with you on a potential UGC campaign. Could we discuss the details?`;
  }, [creator?.firstName]);

  // Open message modal with prefilled message
  const handleOpenMessageModal = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (!creator) return;
    setPrefilledMessage(prefilledCollaborationMessage);
    setIsMessageModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory">
        <Navigation sticky={true} />
        <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-burgundy border-r-transparent mx-auto"></div>
            <div className="mt-6">
              <h3 className="text-2xl font-serif font-semibold text-red-burgundy mb-2">Lumo</h3>
              <p className="text-lg text-subtext">{t('loading.profile')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-ivory">
        <Navigation sticky={true} />
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-serif font-bold text-red-burgundy mb-4">{error || t('errors.notFound')}</h1>
            <p className="mb-8 text-subtext text-lg">{t('errors.notFoundDescription')}</p>
            <Link href="/" className="group relative inline-flex items-center gap-3 bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white px-6 py-3 rounded-2xl font-semibold border border-red-burgundy transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            {t('navigation.backToCreators')}
          </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show auth modal if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-ivory">
        <Navigation sticky={true} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-burgundy border-r-transparent mx-auto"></div>
            <div className="mt-6">
              <h3 className="text-2xl font-serif font-semibold text-red-burgundy mb-2">Lumo</h3>
              <p className="text-lg text-subtext">{t('loading.authentication')}</p>
            </div>
          </div>
        </div>
        <AuthRequiredModal 
          isOpen={showAuthModal} 
          onClose={() => {
            setShowAuthModal(false);
            router.push('/');
          }} 
          creatorName={creator ? `${creator.firstName} ${creator.lastName}` : undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navigation sticky={true} />
      
      {/* Hero Banner with Elegant Breadcrumb */}
      <div className="relative pt-24 pb-16 bg-gradient-to-br from-ivory to-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/dot-pattern.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <Link href="/search" className="inline-flex items-center text-subtext hover:text-red-burgundy transition-colors mb-8 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
            <span className="font-medium">{t('navigation.backToCreators')}</span>
        </Link>
          
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-red-burgundy mb-3">
              {creator.firstName} {creator.lastName}
            </h1>
            <p className="text-lg text-subtext mb-8">{t('hero.luxuryTravelCreator', { city: creator.homeCity })}</p>
            
            {/* Quick Stats */}
            <div className="inline-flex items-center gap-6 px-6 py-3 bg-white/50 backdrop-blur-sm rounded-2xl border border-red-burgundy/10">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-red-burgundy" />
                <span className="text-sm text-subtext">{creator.homeCity}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-red-burgundy" />
                <span className="text-sm text-subtext">{t('hero.followers', { count: creator.followerCount.toLocaleString() })}</span>
              </div>
              {creator.instagramHandle && (
                <a 
                  href={`https://instagram.com/${creator.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-red-burgundy transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-pink-500" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                  </svg>
                  <span className="text-sm">@{creator.instagramHandle}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 lg:gap-16 items-start">
          {/* Left Column - Profile Card & Actions */}
          <aside className="lg:sticky lg:top-32 space-y-6">
            {/* Profile Image Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-red-burgundy/10 overflow-hidden">
              <div className="relative h-[400px] w-full">
              <Image
                src={creator.profileImageUrl}
                alt={`${creator.firstName} ${creator.lastName}`}
                fill
                  sizes="400px"
                  className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-profile.jpg';
                }}
              />
            </div>
                </div>

            <CreatorPackages uid={uid} />

            {/* Action Buttons */}
            <div className="space-y-4">
                <button 
                onClick={handleOpenMessageModal}
                className="w-full group relative inline-flex items-center justify-center gap-3 bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-red-burgundy"
                >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-burgundy/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="relative h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                <span className="relative">{t('actions.messageCreator')}</span>
                </button>
            </div>
        </aside>
        
                    {/* Right Column - Calendar & Instagram Feed */}
          <main className="space-y-8">
            {/* Travel Calendar Section */}
            <div className="bg-white rounded-3xl shadow-lg border border-red-burgundy/10 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-6 w-6 text-red-burgundy" />
                  <h2 className="text-2xl font-serif font-bold text-text">{t('calendar.title')}</h2>
              </div>
            
            <button 
                  onClick={() => setShowFullCalendar(!showFullCalendar)}
                  className="group inline-flex items-center gap-2 bg-red-burgundy/5 text-red-burgundy hover:bg-red-burgundy hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
              >
                {showFullCalendar ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                      {t('calendar.hideCalendar')}
                  </>
                ) : (
                  <>
                      <CalendarIcon className="h-4 w-4" />
                    {t('calendar.showFullCalendar')}
                  </>
                )}
            </button>
            </div>
            
              {/* Next Trip Highlight */}
              {creator.travelPlans.length > 0 && (
                <div className="bg-gradient-to-r from-red-burgundy/5 to-red-burgundy/10 rounded-2xl p-6 mb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-burgundy rounded-full"></div>
                      <span className="text-red-burgundy font-serif text-lg">
                        {creator.travelPlans[0].destination}, {creator.travelPlans[0].country}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span className="bg-white text-red-burgundy px-4 py-1.5 rounded-full text-sm border border-red-burgundy/20">
                        {creator.travelPlans[0].dateRange}
                      </span>
                      <span className={`px-4 py-1.5 rounded-full text-sm ${
                        creator.travelPlans[0].status === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' : 
                        creator.travelPlans[0].status === 'Completed' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {creator.travelPlans[0].status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Upcoming Trips - Matching the same design style */}
              {creator.travelPlans.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-lg font-serif font-semibold text-gray-900 mb-4">{t('trips.otherUpcomingTrips')}</h3>
                  <div className="space-y-4">
                    {creator.travelPlans.slice(1).map((trip, index) => (
                      <div key={trip.id} className="bg-gradient-to-r from-red-burgundy/5 to-red-burgundy/10 rounded-2xl p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-burgundy rounded-full"></div>
                            <span className="text-red-burgundy font-serif text-lg">
                              {trip.destination}, {trip.country}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <span className="bg-white text-red-burgundy px-4 py-1.5 rounded-full text-sm border border-red-burgundy/20">
                              {trip.dateRange}
                            </span>
                            <span className={`px-4 py-1.5 rounded-full text-sm ${
                              trip.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' : 
                              trip.status === 'Completed' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 
                              'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {trip.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar Component */}
              <AnimatePresence>
                {showFullCalendar && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                      {/* Calendar Component */}
                      <div className="rounded-2xl border border-gray-100">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                          <button 
                            onClick={() => {
                              const newDate = new Date(currentDate);
                              newDate.setMonth(newDate.getMonth() - 1);
                              setCurrentDate(newDate);
                            }}
                            className="p-2 hover:bg-red-burgundy/5 rounded-lg transition-colors"
                          >
                            <ChevronLeftIcon className="h-5 w-5 text-red-burgundy" />
                          </button>
                          <h3 className="text-xl font-serif font-bold text-red-burgundy">
                            {currentDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
                          </h3>
                          <button 
                            onClick={() => {
                              const newDate = new Date(currentDate);
                              newDate.setMonth(newDate.getMonth() + 1);
                              setCurrentDate(newDate);
                            }}
                            className="p-2 hover:bg-red-burgundy/5 rounded-lg transition-colors"
                          >
                            <ChevronRightIcon className="h-5 w-5 text-red-burgundy" />
                          </button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="p-6">
                          <div className="grid grid-cols-7 mb-4">
                            {[
                              t('calendar.weekdays.monday'),
                              t('calendar.weekdays.tuesday'), 
                              t('calendar.weekdays.wednesday'),
                              t('calendar.weekdays.thursday'),
                              t('calendar.weekdays.friday'),
                              t('calendar.weekdays.saturday'),
                              t('calendar.weekdays.sunday')
                            ].map((day) => (
                              <div key={day} className="text-center text-xs font-medium text-subtext">
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 35 }, (_, i) => {
                              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 4);
                              const today = new Date();
                              const isToday = date.getDate() === today.getDate() && 
                                              date.getMonth() === today.getMonth() && 
                                              date.getFullYear() === today.getFullYear();
                              const isTravelDay = getTripDateRanges.some(
                                trip => date >= trip.start && date <= trip.end
                              );
                              const trip = getTripDateRanges.find(
                                trip => date >= trip.start && date <= trip.end
                              );
                              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                            return (
                                <div
                                  key={i}
                                  className={`
                                    relative h-12 flex items-center justify-center group cursor-pointer
                                    ${isCurrentMonth ? 'text-text' : 'text-subtext/30'}
                                    ${isToday ? 'ring-1 ring-red-burgundy ring-offset-2 rounded-lg' : ''}
                                    ${isTravelDay ? 'bg-red-burgundy/5 rounded-lg' : ''}
                                    ${isWeekend && isCurrentMonth ? 'text-red-burgundy/80' : ''}
                                    hover:bg-red-burgundy/10 transition-all duration-300
                                  `}
                                >
                                  <span className={`
                                    text-sm z-10 relative font-medium
                                    ${isTravelDay ? 'text-red-burgundy' : ''}
                                  `}>
                                    {date.getDate()}
                                  </span>
                                  
                                  {/* Travel Indicator */}
                                  {isTravelDay && (
                                    <>
                                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-burgundy"></div>
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute inset-0 bg-red-burgundy/10 rounded-lg"></div>
                                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow-lg text-xs text-red-burgundy font-medium whitespace-nowrap">
                                          {trip?.destination}
                                        </div>
                                      </div>
                                    </>
                                  )}
                              </div>
                            );
                            })}
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center space-x-6 border-t border-gray-100 p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-lg bg-red-burgundy/5 flex items-center justify-center">
                              <div className="w-1 h-1 rounded-full bg-red-burgundy"></div>
                            </div>
                            <span className="text-xs text-subtext">{t('calendar.travelDays')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-lg ring-1 ring-red-burgundy ring-offset-2"></div>
                            <span className="text-xs text-subtext">{t('calendar.today')}</span>
                          </div>
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
          </div>
          
            {/* Instagram Connection Coming Soon Section */}
            {!showFullCalendar && (
              <div className="mt-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100 p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                    {t('instagramConnectionComing.title')}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                    {t('instagramConnectionComing.description')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700">{t('instagramConnectionComing.features.autoSync')}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-700">{t('instagramConnectionComing.features.portfolioDisplay')}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700">{t('instagramConnectionComing.features.engagement')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </main>
        </div>
      </div>
      
      {/* Message Modal */}
      <NewMessageModal
        creatorId={creator.uid}
        creatorName={`${creator.firstName} ${creator.lastName}`}
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        initialMessage={prefilledMessage}
        trips={creator.travelPlans.map(trip => ({
          destination: trip.destination,
          country: trip.country,
          startDate: trip.startDate.toISOString(),
          endDate: trip.endDate.toISOString(),
          dateRange: trip.dateRange,
          status: trip.status
        }))}
        packages={creatorPackages}
      />
    </div>
  );
}// review trigger
