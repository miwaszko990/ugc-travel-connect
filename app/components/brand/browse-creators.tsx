'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where, orderBy, limit as limitQuery } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from '@/app/hooks/useAuth';
import CreatorCard from '@/app/components/creator/creator-card';
import NewMessageModal from '@/app/components/messages/new-message-modal';
import { MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

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
    startDate: Date;
    endDate: Date;
  };
  followers?: number;
}

interface Filters {
  search: string;
  destination: string;
  homeCity: string;
  dateStart: string;
  dateEnd: string;
  followers: string;
  tripStatus: string;
  sortBy: string;
}

export default function BrowseCreators() {
  const router = useRouter();
  const { user } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [allCreators, setAllCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Message modal state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Creator['upcomingTrip'] | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    destination: '',
    homeCity: '',
    dateStart: '',
    dateEnd: '',
    followers: '',
    tripStatus: '',
    sortBy: 'recent'
  });

  const followerRanges = [
    { label: 'Any Size', value: '' },
    { label: '1K - 5K', value: '1k-5k' },
    { label: '5K - 25K', value: '5k-25k' },
    { label: '25K - 100K', value: '25k-100k' },
    { label: '100K+', value: '100k+' }
  ];

  const tripStatusOptions = [
    { label: 'Any Status', value: '' },
    { label: 'Planned Trips', value: 'Planned' },
    { label: 'Active Trips', value: 'Active' },
    { label: 'Completed Trips', value: 'Completed' }
  ];

  const sortOptions = [
    { label: 'Recently Joined', value: 'recent' },
    { label: 'Most Followers', value: 'followers' },
    { label: 'Alphabetical', value: 'alphabetical' },
    { label: 'Next Trip Date', value: 'tripDate' }
  ];

  // Fetch all creators once when component mounts
  useEffect(() => {
    fetchAllCreators();
  }, []);

  // Apply filters whenever filters change (with debouncing for search/city)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, allCreators]);

  const fetchAllCreators = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching all creators...');
      
      const q = query(
        collection(db, "users"),
        where("role", "==", "creator"),
        where("profileComplete", "==", true)
      );
      
      const snap = await getDocs(q);
      console.log(`📊 Found ${snap.docs.length} creators in database`);
      
      const creatorsData = await Promise.all(snap.docs.map(async (doc) => {
        const d = doc.data();
        
        const creator: Creator = {
          uid: doc.id,
          firstName: d.firstName || '',
          lastName: d.lastName || '',
          homeCity: d.homeCity || '',
          profileImageUrl: d.profileImageUrl || '/placeholder-profile.jpg',
          followers: d.followerCount || 0,
        };

        // Try to get upcoming trip data
        try {
          const tripsRef = collection(db, 'users', doc.id, 'travelPlans');
          const futureTripsQuery = query(
            tripsRef,
            where('startDate', '>', new Date()),
            orderBy('startDate', 'asc'),
            limitQuery(1)
          );
          const tripsSnap = await getDocs(futureTripsQuery);
          
          if (!tripsSnap.empty) {
            const tripData = tripsSnap.docs[0].data();
            const startDate = tripData.startDate.toDate();
            const endDate = tripData.endDate.toDate();
            
            creator.upcomingTrip = {
              destination: tripData.destination,
              country: tripData.country,
              dateRange: formatDateRange(startDate, endDate),
              startDate: startDate,
              endDate: endDate
            };
          }
        } catch (tripError) {
          console.log('No trips found for creator:', doc.id);
        }

        return creator;
      }));

      console.log(`✅ Loaded ${creatorsData.length} creators`);
      setAllCreators(creatorsData);
    } catch (err) {
      console.error('💥 Error fetching creators:', err);
      setAllCreators([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...allCreators];

    // Search filter (names, cities, and destinations)
    if (filters.search.trim()) {
      filtered = filtered.filter(creator => 
        `${creator.firstName} ${creator.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        creator.homeCity.toLowerCase().includes(filters.search.toLowerCase()) ||
        (creator.upcomingTrip?.destination.toLowerCase().includes(filters.search.toLowerCase()) || false) ||
        (creator.upcomingTrip?.country.toLowerCase().includes(filters.search.toLowerCase()) || false)
      );
    }

    // City filter
    if (filters.homeCity.trim()) {
      filtered = filtered.filter(creator => 
        creator.homeCity.toLowerCase().includes(filters.homeCity.toLowerCase())
      );
    }

      // Destination filter
    if (filters.destination.trim()) {
      filtered = filtered.filter(creator => 
        creator.upcomingTrip?.destination.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }

    // Date range filter
    if (filters.dateStart || filters.dateEnd) {
      filtered = filtered.filter(creator => {
        if (!creator.upcomingTrip) return false;
        
        const tripStartDate = creator.upcomingTrip.startDate;
        const tripEndDate = creator.upcomingTrip.endDate;
        
        if (!tripStartDate || !tripEndDate) return false;
        
        const searchStart = filters.dateStart ? new Date(filters.dateStart) : null;
        const searchEnd = filters.dateEnd ? new Date(filters.dateEnd) : null;
        
        if (searchStart && !searchEnd) {
          return tripStartDate >= searchStart;
        }
        
        if (!searchStart && searchEnd) {
          return tripEndDate <= searchEnd;
        }
        
        if (searchStart && searchEnd) {
          return tripStartDate <= searchEnd && tripEndDate >= searchStart;
      }

      return true;
    });
    }

    // Followers filter
    if (filters.followers) {
      const [min, max] = getFollowerRange(filters.followers);
      filtered = filtered.filter(creator => {
        const followers = creator.followers || 0;
        if (min !== null && followers < min) return false;
        if (max !== null && followers > max) return false;
        return true;
      });
    }

    // Trip status filter
    if (filters.tripStatus) {
      filtered = filtered.filter(creator => {
        if (!creator.upcomingTrip) return false;
        const now = new Date();
        const tripStart = creator.upcomingTrip.startDate;
        const tripEnd = creator.upcomingTrip.endDate;
        
        let currentStatus = 'Planned';
        if (now >= tripStart && now <= tripEnd) {
          currentStatus = 'Active';
        } else if (now > tripEnd) {
          currentStatus = 'Completed';
        }
        
        return currentStatus === filters.tripStatus;
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'followers':
        filtered.sort((a, b) => (b.followers || 0) - (a.followers || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.firstName.localeCompare(b.firstName));
        break;
      case 'tripDate':
        filtered.sort((a, b) => {
          if (!a.upcomingTrip && !b.upcomingTrip) return 0;
          if (!a.upcomingTrip) return 1;
          if (!b.upcomingTrip) return -1;
          return a.upcomingTrip.startDate.getTime() - b.upcomingTrip.startDate.getTime();
        });
        break;
      case 'recent':
      default:
        break;
    }

    console.log(`✅ Applied filters, showing ${filtered.length} creators`);
    setCreators(filtered);
  }, [allCreators, filters]);

  // Helper function to convert follower range to numbers
  const getFollowerRange = (range: string): [number | null, number | null] => {
    switch (range) {
      case '1k-5k': return [1000, 4999];
      case '5k-25k': return [5000, 24999];
      case '25k-100k': return [25000, 99999];
      case '100k+': return [100000, null];
      default: return [null, null];
    }
  };

  // Helper function to format date range
  const formatDateRange = (startDate: Date, endDate: Date): string => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const start = startDate.toLocaleDateString('en-US', options);
    const end = endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' });
    return `${start} - ${end}`;
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    console.log(`🔧 Updating filter ${key}:`, value);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    console.log('🧹 Clearing all filters');
    setFilters({
      search: '',
      destination: '',
      homeCity: '',
      dateStart: '',
      dateEnd: '',
      followers: '',
      tripStatus: '',
      sortBy: 'recent'
    });
  };

  const hasActiveFilters = filters.homeCity.trim() || filters.followers || filters.sortBy !== 'recent' || filters.search.trim() || filters.destination.trim() || filters.dateStart || filters.dateEnd || filters.tripStatus;

  const handleCreatorClick = (creator: Creator) => {
    // For brands, show message modal instead of navigating to profile
    handleMessageCreator(creator);
  };

  const handleMessageCreator = (creator: Creator, trip?: Creator['upcomingTrip']) => {
    setSelectedCreator(creator);
    setSelectedTrip(trip || null);
    setIsMessageModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsMessageModalOpen(false);
    setSelectedCreator(null);
    setSelectedTrip(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-burgundy border-r-transparent mx-auto"></div>
          <div className="mt-6">
            <h3 className="text-2xl font-serif font-semibold text-red-burgundy mb-2">Lumo</h3>
            <p className="text-lg text-subtext">Loading creators...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header Section */}
      <div className="pt-8 pb-16 bg-gradient-to-br from-background to-ivory">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl lg:text-6xl font-serif font-bold text-red-burgundy mb-6">
          Browse Creators
        </h1>
            <p className="text-xl text-subtext max-w-3xl mx-auto">
              Find the perfect luxury travel creator for your brand. Filter by destination, travel dates, home city, audience size, and more.
        </p>
      </div>

          {/* Main Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-subtext" />
            <input
              type="text"
                placeholder="Search creators by name, location, or planned destinations..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-ivory border border-border/30 rounded-2xl text-text placeholder-subtext/60 focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy/40 transition-all duration-300 text-lg shadow-sm"
            />
          </div>
          </div>

          {/* Horizontal Filter Bar */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 w-full max-w-6xl">
              {/* Destination */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Destination"
                  value={filters.destination}
                  onChange={(e) => updateFilter('destination', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border/30 rounded-xl text-text placeholder-subtext/60 focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy/40 transition-all duration-300 shadow-sm"
                />
          </div>

              {/* Home City */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Home City"
                  value={filters.homeCity}
                  onChange={(e) => updateFilter('homeCity', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border/30 rounded-xl text-text placeholder-subtext/60 focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy/40 transition-all duration-300 shadow-sm"
                />
        </div>

              {/* Date Start */}
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateStart}
                  onChange={(e) => updateFilter('dateStart', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border/30 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy/40 transition-all duration-300 shadow-sm"
                />
      </div>

              {/* Date End */}
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateEnd}
                  onChange={(e) => updateFilter('dateEnd', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border/30 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy/40 transition-all duration-300 shadow-sm"
                />
      </div>

              {/* Trip Status */}
              <div className="relative">
                <select
                  value={filters.tripStatus}
                  onChange={(e) => updateFilter('tripStatus', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border/30 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy/40 transition-all duration-300 shadow-sm appearance-none"
                >
                  {tripStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-subtext pointer-events-none" />
              </div>

              {/* Followers */}
              <div className="relative">
                <select
                  value={filters.followers}
                  onChange={(e) => updateFilter('followers', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border/30 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy/40 transition-all duration-300 shadow-sm appearance-none"
                >
                  {followerRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-subtext pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border/30 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy/40 transition-all duration-300 shadow-sm appearance-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-subtext pointer-events-none" />
              </div>
            </div>
                      </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="text-center">
                      <button
                onClick={clearFilters}
                className="group relative inline-flex items-center gap-2 text-red-burgundy hover:text-white bg-white hover:bg-red-burgundy px-4 py-2 rounded-xl font-medium transition-all duration-300 border border-red-burgundy shadow-sm hover:shadow-md"
                      >
                <span>Clear All Filters</span>
                      </button>
            </div>
          )}
                    </div>
                  </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold text-text mb-2">
              {creators.length} Creator{creators.length !== 1 ? 's' : ''} Found
            </h2>
            <p className="text-subtext">
              {hasActiveFilters ? 'Filtered results' : 'All available creators'}
            </p>
              </div>
            </div>

        {/* Creator Grid - Enhanced */}
        {creators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {creators.map((creator) => (
              <div key={creator.uid} className="transform hover:scale-[1.01] transition-transform duration-300">
                <CreatorCard
                  creator={creator}
                  onClick={() => handleCreatorClick(creator)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-burgundy/10 rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="h-10 w-10 text-red-burgundy" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-red-burgundy mb-3">No creators found</h3>
              <p className="text-subtext text-lg mb-8">
                Try adjusting your search terms or filters to find the perfect creators for your brand.
          </p>
          <button
                onClick={clearFilters}
                className="group relative inline-flex items-center gap-3 bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 border border-red-burgundy shadow-sm hover:shadow-md"
              >
                Clear All Filters
          </button>
            </div>
        </div>
      )}
      </div>

      {/* Message Modal */}
      {selectedCreator && (
        <NewMessageModal
          creatorId={selectedCreator.uid}
          creatorName={`${selectedCreator.firstName} ${selectedCreator.lastName}`}
          isOpen={isMessageModalOpen}
          onClose={handleCloseModal}
          trip={selectedTrip ? {
            destination: selectedTrip.destination,
            startDate: selectedTrip.startDate.toISOString().split('T')[0],
            endDate: selectedTrip.endDate.toISOString().split('T')[0]
          } : undefined}
          initialMessage={selectedTrip ? 
            `Hi ${selectedCreator.firstName}! I'm interested in collaborating with you for your upcoming trip to ${selectedTrip.destination}. ` :
            `Hi ${selectedCreator.firstName}! I'm interested in discussing potential collaboration opportunities with you. `
          }
        />
      )}
    </div>
  );
} // review trigger
