'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { type TripInput } from '@/app/lib/firebase/trips';

interface AddTripModalProps {
  isOpen: boolean;
  onAddTrip: (tripData: TripInput) => Promise<void>;
  onClose: () => void;
  t: any;
  tStatus: any;
  tActions: any;
  error?: string | null;
}

export default function AddTripModal({ isOpen, onAddTrip, onClose, t, tStatus, tActions, error }: AddTripModalProps) {
  const [formData, setFormData] = useState<TripInput>({
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    status: 'Planned',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddTrip(formData);
      // Reset form only if successful (modal will close from parent)
      setFormData({
        destination: '',
        country: '',
        startDate: '',
        endDate: '',
        status: 'Planned',
      });
    } catch (err) {
      // Error handling is managed by parent component
      console.error('Error in modal submit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    setFormData({
      destination: '',
      country: '',
      startDate: '',
      endDate: '',
      status: 'Planned',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-ivory px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral mb-2 font-playfair">{t('title')}</h2>
                <button 
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-red-burgundy hover:bg-red-burgundy/10 rounded-full transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-neutral font-medium text-sm font-inter">
                      {t('fields.destination.label')}
                    </span>
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder={t('fields.destination.placeholder')}
                    className="input h-12 px-4 w-full rounded-xl font-medium bg-[#F4F4F5] border-0 focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy font-inter"
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-neutral font-medium text-sm font-inter">
                      {t('fields.country.label')}
                    </span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder={t('fields.country.placeholder')}
                    className="input h-12 px-4 w-full rounded-xl font-medium bg-[#F4F4F5] border-0 focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy font-inter"
                    required
                  />
                </div>
          
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-neutral font-medium text-sm font-inter">
                        {t('fields.startDate.label')}
                      </span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="input h-12 px-4 w-full rounded-xl font-medium bg-[#F4F4F5] border-0 focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy font-inter"
                      required
                    />
                  </div>
            
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-neutral font-medium text-sm font-inter">
                        {t('fields.endDate.label')}
                      </span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="input h-12 px-4 w-full rounded-xl font-medium bg-[#F4F4F5] border-0 focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy font-inter"
                      required
                    />
                  </div>
                </div>
          
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-neutral font-medium text-sm font-inter">
                      {t('fields.status.label')}
                    </span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="select h-12 px-4 w-full rounded-xl font-medium bg-[#F4F4F5] border-0 focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy font-inter"
                    required
                  >
                    <option value="Planned">{tStatus('planned')}</option>
                    <option value="Active">{tStatus('active')}</option>
                    <option value="Completed">{tStatus('completed')}</option>
                  </select>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                  <p className="text-sm font-medium font-inter">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 h-auto w-full font-bold normal-case rounded-[12px] border border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50 shadow-sm transition-all font-inter disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('buttons.cancel')}
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 h-auto w-full font-bold normal-case rounded-[12px] border-none bg-red-burgundy hover:bg-red-burgundy/90 text-white shadow-sm transition-all font-inter flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
                      <span>{t('buttons.saving')}</span>
                    </>
                  ) : (
                    <span>{t('buttons.saveTrip')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} // review trigger
