'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, DocumentData, deleteDoc, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useAuth } from '@/app/hooks/useAuth';
import Image from 'next/image';
import { 
  MapPin, 
  Calendar, 
  Plus,
  Edit3,
  Trash2,
  Plane,
  Globe,
  X
} from 'lucide-react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface TravelPlan {
  id: string;
  destination: string;
  country: string;
  dateRange: string;
  status: "Planned" | "Active" | "Completed";
  startDate?: Date; // For sorting purposes
}

export default function TravelPlans() {
  const { user } = useAuth();
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    status: 'Planned' as 'Planned' | 'Active' | 'Completed'
  });

  useEffect(() => {
    const fetchTravelPlans = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const travelPlansRef = collection(db, 'users', user.uid, 'travelPlans');
        const travelPlansQuery = query(travelPlansRef, orderBy('startDate', 'asc'));
        
        const snapshot = await getDocs(travelPlansQuery);
        
        if (snapshot.empty) {
          setTravelPlans([]);
          setLoading(false);
          return;
        }

        const plans = snapshot.docs.map(doc => {
          const data = doc.data();
          
          // Format dates
          let dateRange = "";
          let startDateObj: Date | undefined;
          
          if (data.startDate && data.endDate) {
            // Convert Firestore Timestamp to JS Date
            const startDate = data.startDate.toDate ? data.startDate.toDate() : new Date(data.startDate);
            const endDate = data.endDate.toDate ? data.endDate.toDate() : new Date(data.endDate);
            startDateObj = startDate;
            
            dateRange = formatDateRange(startDate, endDate);
          }
          
          return {
            id: doc.id,
            destination: data.destination || "",
            country: data.country || "",
            dateRange,
            status: data.status || "Planned",
            startDate: startDateObj,
          };
        });

        // Ensure sorted by startDate
        const sortedPlans = plans.sort((a, b) => {
          if (a.startDate && b.startDate) {
            return a.startDate.getTime() - b.startDate.getTime();
          }
          return 0;
        });

        setTravelPlans(sortedPlans);
      } catch (error) {
        console.error('Error fetching travel plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelPlans();
  }, [user]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const now = new Date();
    const tripDate = new Date(dateString);
    const diffTime = tripDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return null;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Show success message that fades after 3 seconds
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Modal handlers
  const openModal = () => {
    setIsModalOpen(true);
    setFormError(null);
    setFormData({
      destination: '',
      country: '',
      startDate: '',
      endDate: '',
      status: 'Planned'
    });
  };

  const closeModal = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    setIsModalOpen(false);
    setFormError(null);
    setFormData({
      destination: '',
      country: '',
      startDate: '',
      endDate: '',
      status: 'Planned'
    });
  };

  // Form validation
  const validateForm = () => {
    if (!formData.destination.trim()) {
      setFormError('Please enter a destination city');
      return false;
    }
    if (!formData.country.trim()) {
      setFormError('Please enter a country');
      return false;
    }
    if (!formData.startDate) {
      setFormError('Please select a start date');
      return false;
    }
    if (!formData.endDate) {
      setFormError('Please select an end date');
      return false;
    }
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      setFormError('End date must be after start date');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user || !validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      // Parse dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      // Prepare data for Firestore
      const tripData = {
        destination: formData.destination.trim(),
        country: formData.country.trim(),
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        status: formData.status,
        createdAt: Timestamp.now()
      };
      
      // Save to Firestore
      const travelPlansRef = collection(db, 'users', user.uid, 'travelPlans');
      const docRef = await addDoc(travelPlansRef, tripData);
      
      // Format date range for UI display
      const dateRange = formatDateRange(startDate, endDate);
      
      // Create new travel plan for UI
      const newTripPlan: TravelPlan = {
        id: docRef.id,
        destination: formData.destination.trim(),
        country: formData.country.trim(),
        dateRange,
        status: formData.status,
        startDate: startDate
      };
      
      // Add to travel plans and ensure sorting
      setTravelPlans(prev => [...prev, newTripPlan].sort((a, b) => {
        if (a.startDate && b.startDate) {
          return a.startDate.getTime() - b.startDate.getTime();
        }
        return 0;
      }));
      
      // Success
      showSuccessMessage('Trip added successfully!');
      closeModal();
      
    } catch (error) {
      console.error('Error saving travel plan:', error);
      setFormError('Failed to save trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add delete function
  const handleDeleteTrip = async (tripId: string) => {
    if (!user) return;
    
    try {
      setDeleting(tripId);
      
      // Delete from Firestore
      const tripDocRef = doc(db, 'users', user.uid, 'travelPlans', tripId);
      await deleteDoc(tripDocRef);
      
      // Update UI by removing the deleted trip
      setTravelPlans(prev => prev.filter(trip => trip.id !== tripId));

      // Show success message
      showSuccessMessage('Trip deleted successfully!');
    } catch (error) {
      console.error('Error deleting travel plan:', error);
    } finally {
      setDeleting(null);
    }
  };

  // Handle updating trip status
  const handleUpdateStatus = async (tripId: string, newStatus: "Planned" | "Active" | "Completed") => {
    if (!user) return;
    
    try {
      // Update in Firestore
      const tripDocRef = doc(db, 'users', user.uid, 'travelPlans', tripId);
      await updateDoc(tripDocRef, {
        status: newStatus
      });
      
      // Update UI
      setTravelPlans(prev => prev.map(trip => 
        trip.id === tripId ? { ...trip, status: newStatus } : trip
      ));
      
      // Close the dropdown
      setEditingStatus(null);

      // Show success message
      showSuccessMessage('Trip status updated successfully!');
    } catch (error) {
      console.error('Error updating trip status:', error);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-8">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-red-burgundy/20 to-red-burgundy/5 rounded-3xl flex items-center justify-center">
          <Globe className="w-12 h-12 text-red-burgundy/70" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-burgundy rounded-full flex items-center justify-center">
          <Plus className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <h3 className="text-2xl font-serif text-red-burgundy font-semibold mb-3">Plan your next adventure</h3>
      <p className="text-gray-600 text-center max-w-sm mb-8 leading-relaxed">
        Add your travel destinations to connect with brands looking for content in those locations.
      </p>
      
      <button 
        onClick={openModal}
        className="group relative inline-flex items-center gap-3 bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-red-burgundy"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-burgundy/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <Plus className="relative w-5 h-5 text-red-burgundy group-hover:text-white transition-colors duration-300" />
        <span className="relative">Plan Your First Trip</span>
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="relative min-h-screen" style={{backgroundColor: '#FDFCF9'}}>
        <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-burgundy border-r-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your travel plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{backgroundColor: '#FDFCF9'}}>
      {/* Sophisticated Background Pattern - matching hero section */}
      <div className="absolute inset-0">
        {/* Subtle dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 0, 0, 0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Elegant gradient overlays */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-red-burgundy/3 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1/4 h-1/4 bg-gradient-to-tr from-red-burgundy/2 to-transparent rounded-full blur-2xl"></div>
        
        {/* Minimal geometric accents */}
        <div className="absolute top-1/3 left-1/4 w-px h-24 bg-gradient-to-b from-transparent via-red-burgundy/15 to-transparent"></div>
        <div className="absolute bottom-1/2 right-1/3 w-16 h-px bg-gradient-to-r from-transparent via-red-burgundy/15 to-transparent"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header section with improved typography */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
        <div>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-red-burgundy mb-2">Travel Calendar</h1>
              <p className="text-lg text-gray-600">Manage your upcoming destinations and let brands find you</p>
        </div>
            
            {travelPlans.length > 0 && (
        <button 
                onClick={openModal}
                className="group relative inline-flex items-center gap-3 bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-red-burgundy"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-burgundy/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Plus className="relative w-5 h-5 text-red-burgundy group-hover:text-white transition-colors duration-300" />
                <span className="relative">Add New Trip</span>
        </button>
            )}
          </div>
      </div>

      {/* Success message toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-50 text-green-800 px-6 py-3 rounded-lg shadow-lg border border-green-100 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

        {/* Travel plans content */}
        {travelPlans.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6">
          {travelPlans.map((trip) => (
              <div key={trip.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-red-burgundy/10 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-burgundy/20 to-red-burgundy/5 rounded-2xl flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-red-burgundy" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-serif font-semibold text-red-burgundy">{trip.destination}, {trip.country}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{trip.dateRange}</span>
                          {trip.startDate && getDaysUntil(trip.startDate.toISOString()) && (
                            <span className="ml-3 text-red-burgundy font-medium">
                              • {getDaysUntil(trip.startDate.toISOString())}
                            </span>
                          )}
                  </div>
                </div>
              </div>

                    <div className="flex items-center space-x-3">
                {editingStatus === trip.id ? (
                  <select
                    value={trip.status}
                    onChange={(e) => handleUpdateStatus(trip.id, e.target.value as "Planned" | "Active" | "Completed")}
                          className="rounded-lg border border-gray-200 px-3 py-1 text-sm focus:border-red-burgundy focus:ring-0"
                    autoFocus
                    onBlur={() => setEditingStatus(null)}
                  >
                    <option value="Planned">Planned</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </span>
                )}
                      
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => setEditingStatus(trip.id)}
                          className="p-2 text-gray-400 hover:text-red-burgundy hover:bg-red-burgundy/5 rounded-xl transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTrip(trip.id)}
                          disabled={deleting === trip.id}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          {deleting === trip.id ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-r-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-red-burgundy/20 backdrop-blur-md"
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="relative bg-gradient-to-b from-[#FDFCF9] to-white rounded-3xl shadow-2xl w-full max-w-lg mx-auto border border-red-burgundy/10">
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-red-burgundy/10">
              <div>
                <h2 className="text-2xl font-serif font-bold text-red-burgundy">Add new destination</h2>
                <p className="text-gray-600 text-sm mt-2">Where will you be traveling next?</p>
              </div>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-red-burgundy hover:bg-red-burgundy/5 rounded-full p-2 transition-all duration-200 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Form */}
            <div className="p-8 space-y-6">
              {/* Error Message */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {formError}
                </div>
              )}

              {/* City and Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-red-burgundy mb-3">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. London"
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full h-12 border border-red-burgundy/20 rounded-2xl focus:border-red-burgundy focus:ring-red-burgundy/10 text-base bg-white/50 backdrop-blur-sm px-4 focus:outline-none focus:ring-2 disabled:opacity-50"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-red-burgundy mb-3">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. United Kingdom"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full h-12 border border-red-burgundy/20 rounded-2xl focus:border-red-burgundy focus:ring-red-burgundy/10 text-base bg-white/50 backdrop-blur-sm px-4 focus:outline-none focus:ring-2 disabled:opacity-50"
                  />
                </div>
              </div>
              
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-red-burgundy mb-3">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    disabled={isSubmitting}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-12 border border-red-burgundy/20 rounded-2xl focus:border-red-burgundy focus:ring-red-burgundy/10 text-base bg-white/50 backdrop-blur-sm px-4 focus:outline-none focus:ring-2 disabled:opacity-50"
                  />
        </div>
                <div>
                  <label className="block text-sm font-semibold text-red-burgundy mb-3">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    disabled={isSubmitting}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full h-12 border border-red-burgundy/20 rounded-2xl focus:border-red-burgundy focus:ring-red-burgundy/10 text-base bg-white/50 backdrop-blur-sm px-4 focus:outline-none focus:ring-2 disabled:opacity-50"
            />
          </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-red-burgundy mb-3">
                  Status
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Planned' | 'Active' | 'Completed' }))}
                  disabled={isSubmitting}
                  className="w-full h-12 border border-red-burgundy/20 rounded-2xl focus:border-red-burgundy focus:ring-red-burgundy/10 text-base bg-white/50 backdrop-blur-sm px-4 font-medium text-gray-700 focus:outline-none focus:ring-2 disabled:opacity-50"
                >
                  <option value="Planned">Planned</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-white text-gray-600 hover:text-red-burgundy border border-red-burgundy/20 hover:border-red-burgundy/40 rounded-2xl font-medium transition-all duration-300 hover:bg-red-burgundy/5 disabled:opacity-50"
                >
                  Cancel
                </button>
          <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.destination.trim() || !formData.country.trim() || !formData.startDate || !formData.endDate}
                  className="group relative flex-1 inline-flex items-center justify-center gap-3 bg-red-burgundy text-white hover:bg-red-burgundy/90 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-1 overflow-hidden shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {isSubmitting ? (
                    <>
                      <div className="relative w-5 h-5 border-2 border-white border-r-transparent rounded-full animate-spin"></div>
                      <span className="relative">Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="relative w-5 h-5" />
                      <span className="relative">Add Trip</span>
                    </>
                  )}
          </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 