'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { X, Globe, MapPin, Users, Calendar, ExternalLink } from 'lucide-react';
import { getBrandProfile } from '@/app/lib/firebase/utils';

interface BrandProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  brandName: string;
  brandProfilePic?: string;
}

interface BrandProfile {
  brandName: string;
  instagramHandle: string;
  website?: string;
  description: string;
  industry: string;
  location: string;
  profileImageUrl?: string;
  followersCount?: number;
  createdAt?: any;
}

export default function BrandProfileModal({ 
  isOpen, 
  onClose, 
  brandId, 
  brandName,
  brandProfilePic 
}: BrandProfileModalProps) {
  const t = useTranslations('messages.brandProfile');
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !brandId) return;

    const loadBrandProfile = async () => {
      setLoading(true);
      try {
        const profile = await getBrandProfile(brandId);
        if (profile) {
          setBrandProfile(profile);
        }
      } catch (error) {
        console.error('Error loading brand profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBrandProfile();
  }, [isOpen, brandId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-[20px] shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-[20px] border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold text-gray-900">{t('title')}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-burgundy border-r-transparent"></div>
                <span className="ml-3 text-gray-600">{t('loading')}</span>
              </div>
            ) : brandProfile ? (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="text-center pt-4">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <Image
                      src={brandProfile.profileImageUrl || brandProfilePic || '/placeholder-profile.jpg'}
                      alt={brandProfile.brandName}
                      fill
                      className="rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
                    {brandProfile.brandName}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{brandProfile.location}</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-[12px] p-4 text-center">
                    <div className="font-semibold text-lg text-gray-900">
                      {brandProfile.followersCount?.toLocaleString() || t('placeholders.noFollowers')}
                    </div>
                    <div className="text-sm text-gray-500">{t('stats.followers')}</div>
                  </div>
                  <div className="bg-gray-50 rounded-[12px] p-4 text-center">
                    <div className="font-semibold text-lg text-gray-900 capitalize">
                      {brandProfile.industry || t('placeholders.noIndustry')}
                    </div>
                    <div className="text-sm text-gray-500">{t('stats.industry')}</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('sections.about')}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {brandProfile.description || t('placeholders.noDescription')}
                  </p>
                </div>

                {/* Links */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">{t('sections.links')}</h4>
                  
                  {/* Instagram */}
                  <a
                    href={`https://instagram.com/${brandProfile.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[12px] hover:shadow-lg transition-all duration-200"
                    title={t('actions.viewInstagram')}
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{t('links.instagram')}</div>
                      <div className="text-sm opacity-90">@{brandProfile.instagramHandle}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </a>

                  {/* Website */}
                  {brandProfile.website ? (
                    <a
                      href={brandProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-[12px] hover:bg-blue-100 transition-colors"
                      title={t('actions.openWebsite')}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{t('links.website')}</div>
                        <div className="text-sm opacity-70">{brandProfile.website.replace(/^https?:\/\//, '')}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 opacity-70" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 text-gray-400 rounded-[12px]">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{t('links.website')}</div>
                        <div className="text-sm">{t('placeholders.noWebsite')}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Member Since */}
                {brandProfile.createdAt && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {t('memberSince')} {new Date(brandProfile.createdAt.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">{t('notFound')}</div>
                <button
                  onClick={onClose}
                  className="text-red-burgundy hover:text-red-burgundy/80 font-medium"
                >
                  {t('actions.closeModal')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 