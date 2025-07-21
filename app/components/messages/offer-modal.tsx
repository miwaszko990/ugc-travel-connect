'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { getUserTrips, Trip } from '@/app/lib/firebase/trips';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerData: {
    trip: Trip;
    description: string;
    price: number;
  }) => void;
  creatorId?: string; // ID of the creator whose trips we want to fetch
  creatorName?: string; // Name of the creator for display
}

export default function OfferModal({ isOpen, onClose, onSubmit, creatorId, creatorName }: OfferModalProps) {
  const { user } = useAuth();
  const [selectedTripId, setSelectedTripId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Fetch creator's trips when modal opens
  useEffect(() => {
    if (isOpen && creatorId) {
      fetchCreatorTrips();
    }
  }, [isOpen, creatorId]);

  const fetchCreatorTrips = async () => {
    if (!creatorId) return;
    
    setLoadingTrips(true);
    try {
      console.log('🧳 Fetching trips for creator:', creatorId);
      const creatorTrips = await getUserTrips(creatorId);
      setTrips(creatorTrips);
      console.log('🧳 Loaded trips for offer modal:', creatorTrips.length, 'trips for creator:', creatorName);
    } catch (error) {
      console.error('💥 Error loading creator trips:', error);
      setTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTripId || !description.trim() || !price) return;

    const selectedTrip = trips.find(trip => trip.id === selectedTripId);
    if (!selectedTrip) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        trip: selectedTrip,
        description: description.trim(),
        price: parseFloat(price)
      });
      
      // Reset form
      setSelectedTripId('');
      setDescription('');
      setPrice('');
      onClose();
    } catch (error) {
      console.error('Error submitting offer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedTripId('');
      setDescription('');
      setPrice('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={handleClose} />
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Send Collaboration Offer</h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trip Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trip
            </label>
            {!creatorId ? (
              <div className="w-full border border-gray-300 rounded px-3 py-2 text-gray-500 text-sm">
                No creator selected
              </div>
            ) : loadingTrips ? (
              <div className="w-full border border-gray-300 rounded px-3 py-2 text-gray-500 text-sm">
                Loading trips...
              </div>
            ) : trips.length === 0 ? (
              <div className="w-full border border-gray-300 rounded px-3 py-2 text-gray-500 text-sm">
                No trips available
              </div>
            ) : (
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-red-burgundy focus:ring-1 focus:ring-red-burgundy"
                required
                disabled={isSubmitting}
              >
                <option value="">Choose which trip you're interested in...</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.destination}, {trip.country}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 3 Instagram posts, 2 TikTok videos, 1 YouTube short showcasing local attractions..."
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-red-burgundy focus:ring-1 focus:ring-red-burgundy resize-none text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="500"
                min="1"
                className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 focus:border-red-burgundy focus:ring-1 focus:ring-red-burgundy text-sm"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingTrips || trips.length === 0 || !creatorId}
              className="flex-1 bg-red-burgundy text-white px-4 py-2 rounded hover:bg-red-burgundy/90 disabled:opacity-50 text-sm font-medium"
            >
              {isSubmitting ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} // review trigger
