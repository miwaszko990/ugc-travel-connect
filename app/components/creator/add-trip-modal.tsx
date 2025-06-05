'use client';

import { useState } from 'react';

interface TripData {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed';
}

interface AddTripModalProps {
  isOpen: boolean;
  onSave: (tripData: TripData) => void;
  onClose: () => void;
}

export default function AddTripModal({ isOpen, onSave, onClose }: AddTripModalProps) {
  const [formData, setFormData] = useState<TripData>({
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    status: 'Planned',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      destination: '',
      country: '',
      startDate: '',
      endDate: '',
      status: 'Planned',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-burgundy/10 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-burgundy/5 to-red-burgundy/10 px-6 py-4 border-b border-red-burgundy/10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif font-medium text-red-burgundy">Add New Trip</h3>
                <button 
          onClick={onClose}
                  className="p-2 text-gray-400 hover:text-red-burgundy hover:bg-red-burgundy/10 rounded-full transition-all duration-200"
        >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-serif font-medium text-red-burgundy mb-2">
                    Destination
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy transition-all duration-200 font-serif"
              placeholder="e.g. Paris"
              required
            />
          </div>
          
                <div>
                  <label className="block text-sm font-serif font-medium text-red-burgundy mb-2">
                    Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy transition-all duration-200 font-serif"
              placeholder="e.g. France"
              required
            />
          </div>
          
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-serif font-medium text-red-burgundy mb-2">
                      Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy transition-all duration-200 font-serif"
                required
              />
            </div>
            
                  <div>
                    <label className="block text-sm font-serif font-medium text-red-burgundy mb-2">
                      End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy transition-all duration-200 font-serif"
                required
              />
            </div>
          </div>
          
                <div>
                  <label className="block text-sm font-serif font-medium text-red-burgundy mb-2">
                    Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy transition-all duration-200 font-serif bg-white"
              required
            >
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
                </div>
          </div>
          
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl font-serif font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit"
                  className="flex-1 bg-red-burgundy hover:bg-red-burgundy/90 text-white px-4 py-3 rounded-xl font-serif font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Save Trip
            </button>
          </div>
        </form>
      </div>
        </div>
      </div>
    </div>
  );
} 