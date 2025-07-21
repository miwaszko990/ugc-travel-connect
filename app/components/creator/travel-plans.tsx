"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
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

interface TravelPlan {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed';
}

interface TravelPlansProps {
  onAddTrip?: () => void;
}

const TravelPlans: React.FC<TravelPlansProps> = ({ onAddTrip }) => {
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([
    {
      id: '1',
      destination: 'London',
      country: 'United Kingdom',
      startDate: '2024-05-23',
      endDate: '2024-05-28',
      status: 'Planned'
    },
    {
      id: '2',
      destination: 'Paris',
      country: 'France',
      startDate: '2024-06-10',
      endDate: '2024-06-15',
      status: 'Active'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    status: 'Planned' as 'Planned' | 'Active' | 'Completed'
  });

  const handleAddTrip = () => {
    if (newTrip.destination && newTrip.country && newTrip.startDate && newTrip.endDate) {
      const trip: TravelPlan = {
        id: Date.now().toString(),
        ...newTrip
      };
      setTravelPlans([...travelPlans, trip]);
      setNewTrip({ destination: '', country: '', startDate: '', endDate: '', status: 'Planned' });
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewTrip({ destination: '', country: '', startDate: '', endDate: '', status: 'Planned' });
  };

  const handleDeleteTrip = (id: string) => {
    setTravelPlans(travelPlans.filter(trip => trip.id !== id));
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
      <p className="text-subtext text-center max-w-sm mb-8 leading-relaxed">
        Add your travel destinations to connect with brands looking for content in those locations.
      </p>
      
        <button 
          onClick={() => setIsModalOpen(true)}
        className="group relative inline-flex items-center gap-3 bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-red-burgundy"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-burgundy/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <Plus className="relative w-5 h-5 text-red-burgundy group-hover:text-white transition-colors duration-300" />
        <span className="relative">Plan Your First Trip</span>
      </button>
    </div>
  );

  // Modal Component
  const AddTripModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop with luxury blur effect */}
        <div 
          className="absolute inset-0 bg-red-burgundy/20 backdrop-blur-md"
          onClick={handleCloseModal}
        />
        
        {/* Modal with hero section styling */}
        <div className="relative bg-gradient-to-b from-[#FDFCF9] to-white rounded-3xl shadow-2xl w-full max-w-lg mx-auto border border-red-burgundy/10">
          {/* Header with luxury styling */}
          <div className="flex items-center justify-between p-8 border-b border-red-burgundy/10">
            <div>
              <h2 className="text-2xl font-serif font-bold text-red-burgundy">Add new destination</h2>
              <p className="text-subtext text-sm mt-2">Where will you be traveling next?</p>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-red-burgundy hover:bg-red-burgundy/5 rounded-full p-2 transition-all duration-200"
            >
              <X className="w-5 h-5" />
        </button>
      </div>
      
          {/* Form with consistent styling */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-red-burgundy mb-3">
                  City
                </label>
                <Input
                  placeholder="e.g. London"
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
                  className="h-12 border-red-burgundy/20 rounded-2xl focus:border-red-burgundy focus:ring-red-burgundy/10 text-base bg-white/50 backdrop-blur-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-red-burgundy mb-3">
                  Country
                </label>
                <Input
                  placeholder="e.g. United Kingdom"
                  value={newTrip.country}
                  onChange={(e) => setNewTrip({...newTrip, country: e.target.value})}
                  className="h-12 border-red-burgundy/20 rounded-2xl focus:border-red-burgundy focus:ring-red-burgundy/10 text-base bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-red-burgundy mb-3">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={newTrip.startDate}
                  onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})}
                  className="h-12 border-red-burgundy/20 rounded-2xl focus:border-red-burgundy focus:ring-red-burgundy/10 text-base bg-white/50 backdrop-blur-sm"
                />
              </div>
                <div>
                <label className="block text-sm font-semibold text-red-burgundy mb-3">
                  End Date
                </label>
                <Input
                  type="date"
                  value={newTrip.endDate}
                  onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                  className="h-12 border-red-burgundy/20 rounded-2xl focus:border-red-burgundy focus:ring-red-burgundy/10 text-base bg-white/50 backdrop-blur-sm"
                />
              </div>
                </div>

            <div>
              <label className="block text-sm font-semibold text-red-burgundy mb-3">
                Status
              </label>
                      <select 
                value={newTrip.status}
                onChange={(e) => setNewTrip({...newTrip, status: e.target.value as 'Planned' | 'Active' | 'Completed'})}
                className="w-full h-12 border border-red-burgundy/20 rounded-2xl focus:border-red-burgundy focus:ring-red-burgundy/10 text-base bg-white/50 backdrop-blur-sm px-4 font-medium text-gray-700"
                      >
                        <option value="Planned">Planned</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
            
            {/* Buttons with hero section styling */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-6 py-3 bg-white text-subtext hover:text-red-burgundy border border-red-burgundy/20 hover:border-red-burgundy/40 rounded-2xl font-medium transition-all duration-300 hover:bg-red-burgundy/5"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTrip}
                disabled={!newTrip.destination || !newTrip.country || !newTrip.startDate || !newTrip.endDate}
                className="group relative flex-1 inline-flex items-center justify-center gap-3 bg-red-burgundy text-white hover:bg-red-burgundy/90 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-1 overflow-hidden shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Plus className="relative w-5 h-5" />
                <span className="relative">Add Trip</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              <p className="text-lg text-subtext">Manage your upcoming destinations and let brands find you</p>
            </div>
            
            {travelPlans.length > 0 && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="group relative inline-flex items-center gap-3 bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-red-burgundy"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-burgundy/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Plus className="relative w-5 h-5 text-red-burgundy group-hover:text-white transition-colors duration-300" />
                <span className="relative">Plan Your First Trip</span>
              </button>
            )}
          </div>
        </div>

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
                        <div className="flex items-center text-subtext mt-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                          {getDaysUntil(trip.startDate) && (
                            <span className="ml-3 text-red-burgundy font-medium">
                              • {getDaysUntil(trip.startDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                      
                      <div className="flex space-x-1">
                        <button className="p-2 text-gray-400 hover:text-red-burgundy hover:bg-red-burgundy/5 rounded-xl transition-colors">
                          <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTrip(trip.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      <AddTripModal />
    </div>
  );
};

export default React.memo(TravelPlans); // review trigger
