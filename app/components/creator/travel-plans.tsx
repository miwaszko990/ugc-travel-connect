"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/auth/useAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { 
  MapPin, 
  Calendar, 
  Plus, 
  Trash2,
  Plane,
  Globe,
  X
} from 'lucide-react';
import { 
  getUserTrips, 
  addTrip, 
  deleteTrip as deleteFirestoreTrip,
  type Trip,
  type TripInput
} from '@/app/lib/firebase/trips';
import AddTripModal from './add-trip-modal';

interface TravelPlansProps {
  onAddTrip?: () => void;
}

const TravelPlans: React.FC<TravelPlansProps> = ({ onAddTrip }) => {
  const t = useTranslations('creator.travelCalendar');
  const tStatus = useTranslations('creator.travelCalendar.statuses');
  const tActions = useTranslations('creator.travelCalendar.actions');
  const { user } = useAuth();
  
  const [travelPlans, setTravelPlans] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch trips from Firestore when component mounts or user changes
  useEffect(() => {
    const fetchTrips = async () => {
      if (!user?.uid) {
        setTravelPlans([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const trips = await getUserTrips(user.uid);
        setTravelPlans(trips);
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load travel plans');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user?.uid]);

  const handleAddTrip = async (tripData: TripInput) => {
    if (!user?.uid) {
      setError('Please sign in to add trips');
      return;
    }

    try {
      setError(null);
      const tripId = await addTrip(user.uid, tripData);
      
      if (tripId) {
        // Add the new trip to local state with the generated ID
        const newTrip: Trip = {
          id: tripId,
          ...tripData
        };
        setTravelPlans(prev => [...prev, newTrip]);
        setIsModalOpen(false);
      } else {
        setError('Failed to add trip');
      }
    } catch (err) {
      console.error('Error adding trip:', err);
      setError('Failed to add trip');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!user?.uid) {
      setError('Please sign in to delete trips');
      return;
    }

    try {
      setError(null);
      const success = await deleteFirestoreTrip(user.uid, tripId);
      
      if (success) {
        // Remove from local state
        setTravelPlans(prev => prev.filter(trip => trip.id !== tripId));
      } else {
        setError('Failed to delete trip');
      }
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError('Failed to delete trip');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const timeDiff = targetDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planned':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Completed':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case 'Planned':
        return tStatus('planned');
      case 'Active':
        return tStatus('active');
      case 'Completed':
        return tStatus('completed');
      default:
        return status;
    }
  };

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12 sm:py-16 px-4">
      <div className="mb-6 sm:mb-8">
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-burgundy/10 to-red-burgundy/5 rounded-full flex items-center justify-center mb-4 sm:mb-6">
          <Plane className="w-10 h-10 sm:w-12 sm:h-12 text-red-burgundy" />
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-semibold text-red-burgundy mb-2 sm:mb-3">
          {t('noTrips.title')}
        </h3>
        <p className="text-base sm:text-lg text-subtext max-w-md mx-auto mb-6 sm:mb-8">
          {t('noTrips.subtitle')}
        </p>
      </div>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-red-burgundy text-sm sm:text-base w-full sm:w-auto max-w-xs sm:max-w-none mx-auto"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-burgundy/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <Plus className="relative w-4 h-4 sm:w-5 sm:h-5 text-red-burgundy group-hover:text-white transition-colors duration-300" />
        <span className="relative">{t('noTrips.buttonText')}</span>
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-burgundy border-r-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">{t('loading') || 'Loading travel plans...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-serif font-semibold text-gray-600 mb-2">
            Sign in to view your travel plans
          </h3>
          <p className="text-gray-500">
            Please sign in to manage your destinations and travel calendar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background styling similar to hero section */}
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
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-red-burgundy/3 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1/4 h-1/4 bg-gradient-to-tr from-red-burgundy/2 to-transparent rounded-full blur-2xl"></div>
        
        {/* Minimal geometric accents */}
        <div className="absolute top-1/3 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-red-burgundy/20 to-transparent"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-px bg-gradient-to-r from-transparent via-red-burgundy/20 to-transparent"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        {/* Header section with mobile-optimized typography */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-red-burgundy mb-2">{t('title')}</h1>
              <p className="text-base sm:text-lg text-subtext">{t('subtitle')}</p>
            </div>
            
            {travelPlans.length > 0 && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-red-burgundy text-sm sm:text-base w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-burgundy/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Plus className="relative w-4 h-4 sm:w-5 sm:h-5 text-red-burgundy group-hover:text-white transition-colors duration-300" />
                <span className="relative">{t('planFirstTrip')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Travel plans content */}
        {travelPlans.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {travelPlans.map((trip) => (
              <div key={trip.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-3xl shadow-lg border border-red-burgundy/10 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-4 sm:p-6">
                  {/* Mobile: Stack layout, Desktop: Horizontal layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    {/* Trip info section */}
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 mb-4 sm:mb-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-burgundy/20 to-red-burgundy/5 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-red-burgundy" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-serif font-semibold text-red-burgundy mb-1 truncate">{trip.destination}, {trip.country}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center text-subtext text-sm sm:text-base">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                          </div>
                          {trip.status === 'Planned' && (
                            <span className="mt-1 sm:mt-0 sm:ml-3 text-red-burgundy font-medium text-sm">
                              • {t('daysUntil', { days: getDaysUntil(trip.startDate) })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions section */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                        {getStatusTranslation(trip.status)}
                      </span>
                      
                      <button 
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors flex-shrink-0"
                        title={tActions('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddTripModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onAddTrip={handleAddTrip} 
        t={t}
        tStatus={tStatus}
        tActions={tActions}
        error={error}
      />
    </div>
  );
};

export default React.memo(TravelPlans);
