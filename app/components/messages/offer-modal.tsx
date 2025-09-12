'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// Safe translation accessor to avoid crashes when NextIntlClientProvider isn't mounted
function useSafeT(namespace: string) {
  try {
    return useTranslations(namespace);
  } catch (error) {
    console.warn(`NextIntl context not available for namespace ${namespace}, using fallback`);
    return ((key: string) => key) as (key: string, vars?: any) => string;
  }
}
import { motion } from 'framer-motion';
import { X, Package, Edit3 } from 'lucide-react';
import { useAuth } from '@/app/hooks/auth';
import { getUserTrips, Trip } from '@/app/lib/firebase/trips';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerData: {
    trip: Trip;
    description: string;
    price: number;
    packageId?: string;
  }) => void;
  creatorId?: string; // ID of the creator whose trips we want to fetch
  creatorName?: string; // Name of the creator for display
}

// Package definitions with pricing
const PACKAGES = [
  {
    id: 'mini',
    price: 200,
    titleKey: 'mini.title',
    descriptionKey: 'mini.description'
  },
  {
    id: 'content', 
    price: 450,
    titleKey: 'content.title',
    descriptionKey: 'content.description'
  },
  {
    id: 'full',
    price: 900,
    titleKey: 'full.title', 
    descriptionKey: 'full.description'
  }
];

export default function OfferModal({ isOpen, onClose, onSubmit, creatorId, creatorName }: OfferModalProps) {
  const { user } = useAuth();
  const t = useSafeT('brand.messaging.offerModal');
  const tPackages = useSafeT('brand.messaging.offerModal.packages');
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [creatorPackages, setCreatorPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Fetch creator's trips and packages when modal opens
  useEffect(() => {
    console.log('🔄 Offer modal useEffect triggered, isOpen:', isOpen, 'creatorId:', creatorId);
    if (isOpen && creatorId) {
      console.log('✅ Starting to fetch trips and packages...');
      fetchCreatorTrips();
      fetchCreatorPackages();
    }
  }, [isOpen, creatorId]);

  // Update description and price when package is selected
  useEffect(() => {
    if (selectedPackage) {
      // First check creator's packages
      const packageIndex = parseInt(selectedPackage);
      if (!isNaN(packageIndex) && creatorPackages[packageIndex]) {
        const creatorPkg = creatorPackages[packageIndex];
        setDescription(creatorPkg.description || '');
        setPrice(creatorPkg.price?.toString() || '0');
      } else {
        // Fallback to hard-coded packages for backward compatibility
      const pkg = PACKAGES.find(p => p.id === selectedPackage);
      if (pkg) {
        setDescription(`[PACKAGE:${selectedPackage}]${tPackages(pkg.descriptionKey)}`);
        setPrice(pkg.price.toString());
        }
      }
    } else if (selectedPackage === 'custom') {
      setDescription('');
      setPrice('');
    }
  }, [selectedPackage, tPackages, creatorPackages]);

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

  const fetchCreatorPackages = async () => {
    if (!creatorId) {
      console.log('📦 No creatorId provided to fetchCreatorPackages');
      return;
    }
    
    setLoadingPackages(true);
    try {
      console.log('📦 Fetching creator packages for offer modal, creatorId:', creatorId);
      const userDoc = await getDoc(doc(db, 'users', creatorId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const servicePackages = userData.servicePackages || [];
        console.log('📦 Found creator packages:', servicePackages);
        console.log('📦 Creator packages length:', servicePackages.length);
        setCreatorPackages(servicePackages);
      } else {
        console.log('📦 No creator document found for creatorId:', creatorId);
        setCreatorPackages([]);
      }
    } catch (error) {
      console.error('📦 Error fetching creator packages:', error);
      setCreatorPackages([]);
    } finally {
      setLoadingPackages(false);
      console.log('📦 Finished loading packages, final state:', creatorPackages.length);
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
      setSelectedPackage('');
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
      setSelectedPackage('');
      setDescription('');
      setPrice('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('trip.label')}
            </label>
            {!creatorId ? (
              <div className="w-full border border-gray-300 rounded px-3 py-2 text-gray-500 text-sm">
                {t('trip.noCreator')}
              </div>
            ) : loadingTrips ? (
              <div className="w-full border border-gray-300 rounded px-3 py-2 text-gray-500 text-sm">
                {t('trip.loading')}
              </div>
            ) : trips.length === 0 ? (
              <div className="w-full border border-gray-300 rounded px-3 py-2 text-gray-500 text-sm">
                {t('trip.noTrips')}
              </div>
            ) : (
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-red-burgundy focus:ring-1 focus:ring-red-burgundy"
                required
                disabled={isSubmitting}
              >
                <option value="">{t('trip.placeholder')}</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.destination}, {trip.country}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Package Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('package.label')}
            </label>
            <div className="space-y-3">
              {loadingPackages ? (
                <div className="p-3 text-gray-500 text-sm">Loading packages...</div>
              ) : creatorPackages.length > 0 ? (
                /* Creator's Packages */
                creatorPackages.map((pkg, index) => (
                  <label key={index} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="package"
                      value={index.toString()}
                      checked={selectedPackage === index.toString()}
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="w-4 h-4 text-red-burgundy border-gray-300 focus:ring-red-burgundy"
                    />
                    <div className="flex-1 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-red-burgundy" />
                        <span className="font-medium text-sm text-gray-900">
                          {pkg.name}
                        </span>
                        <span className="text-sm text-red-burgundy font-semibold ml-auto">
                          PLN {pkg.price}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 pl-6">
                        {pkg.description}
                      </p>
                    </div>
                  </label>
                ))
              ) : (
                /* Fallback to Predefined Packages */
                PACKAGES.map((pkg, index) => (
                <label key={pkg.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="package"
                    value={pkg.id}
                    checked={selectedPackage === pkg.id}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="w-4 h-4 text-red-burgundy border-gray-300 focus:ring-red-burgundy"
                  />
                  <div className="flex-1 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-red-burgundy" />
                      <span className="font-medium text-sm text-gray-900">
                        {tPackages(pkg.titleKey)}
                      </span>
                      <span className="text-sm text-red-burgundy font-semibold ml-auto">
                        PLN {pkg.price}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 pl-6">
                      {tPackages(pkg.descriptionKey)}
                    </p>
                  </div>
                </label>
                ))
              )}
              
              {/* Custom Option */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="package"
                  value="custom"
                  checked={selectedPackage === 'custom'}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-4 h-4 text-red-burgundy border-gray-300 focus:ring-red-burgundy"
                />
                <div className="flex-1 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-red-burgundy" />
                    <span className="font-medium text-sm text-gray-900">
                      {t('package.custom')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 pl-6">
                    {t('package.customDescription')}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Description (editable when package is selected) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description.label')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('description.placeholder')}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-red-burgundy focus:ring-1 focus:ring-red-burgundy resize-none text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Price (editable when package is selected) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('amount.label')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">PLN</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t('amount.placeholder')}
                min="1"
                className="w-full border border-gray-300 rounded pl-12 pr-3 py-2 focus:border-red-burgundy focus:ring-1 focus:ring-red-burgundy text-sm"
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
              {t('buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingTrips || trips.length === 0 || !creatorId || !selectedPackage}
              className="flex-1 bg-red-burgundy text-white px-4 py-2 rounded hover:bg-red-burgundy/90 disabled:opacity-50 text-sm font-medium"
            >
              {isSubmitting ? t('buttons.sending') : t('buttons.send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}