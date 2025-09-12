'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

// Safe translation accessor to avoid crashes when NextIntlClientProvider isn't mounted
function useSafeT(namespace: string) {
  try {
    return useTranslations(namespace);
  } catch (error) {
    console.warn(`NextIntl context not available for namespace ${namespace}, using fallback`);
    return ((key: string) => key) as (key: string, vars?: any) => string;
  }
}
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/auth';
import { sendMessage, getConversationId } from '@/app/lib/firebase/messages';
import { toast } from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';







interface Trip {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  dateRange: string;
  status: string;
}

interface Package {
  name: string;
  price: string;
  description: string;
}

interface NewMessageModalProps {
  creatorId: string;
  creatorName: string;
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  trips?: Trip[]; // Array of all available trips
  packages?: Package[]; // Array of creator's packages
}

export default function NewMessageModal({ 
  creatorId, 
  creatorName, 
  isOpen, 
  onClose,
  initialMessage = '',
  trips,
  packages
}: NewMessageModalProps) {
  const [message, setMessage] = useState(initialMessage);
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [selectedTripIndex, setSelectedTripIndex] = useState<number | null>(null);
  const [selectedPackageIndex, setSelectedPackageIndex] = useState<number | null>(null);
  const { user } = useAuth();
  const t = useSafeT('messages.newMessageModal');
  const router = useRouter();
  const locale = useLocale();
  
  if (!isOpen) return null;
  
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-xl font-bold mb-4">{t('errors.signInRequired.title')}</h3>
          <p className="mb-4">{t('errors.signInRequired.message')}</p>
          <div className="flex justify-end">
            <button className="btn btn-ghost" onClick={onClose}>
              {t('errors.signInRequired.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Only allow brands to send messages
  if (user.role !== 'brand') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-xl font-bold mb-4">{t('errors.messagingRestricted.title')}</h3>
          <p className="mb-4">{t('errors.messagingRestricted.message')}</p>
          <div className="flex justify-end">
            <button className="btn btn-ghost" onClick={onClose}>
              {t('errors.messagingRestricted.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      setSending(true);
      const senderName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.email || 'Anonymous User';
      const conversationId = getConversationId(user.uid, creatorId);
      let fullMessage = message;
      
      // Add trip context if selected
      if (trips && trips.length > 0 && selectedTripIndex !== null) {
        const trip = trips[selectedTripIndex];
        const fromDate = format(new Date(trip.startDate), 'MMM d');
        const toDate = format(new Date(trip.endDate), 'MMM d, yyyy');
        const tripHeader = `🛫 ${trip.destination}, ${trip.country} - ${fromDate} – ${toDate}`;
        fullMessage = `${tripHeader}\n\n${message}`;
      }
      
      // Add package context if selected
      if (packages && packages.length > 0 && selectedPackageIndex !== null) {
        const pkg = packages[selectedPackageIndex];
        const packageHeader = `📦 ${t('packageContext.interestedIn')}: ${pkg.name} - PLN ${pkg.price}`;
        const packageDetails = `${t('packageContext.description')}: ${pkg.description}`;
        
        if (fullMessage.includes('🛫')) {
          // If trip is already added, append package info
          fullMessage = `${fullMessage}\n\n${packageHeader}\n${packageDetails}`;
        } else {
          // If no trip, add package info at the beginning
          fullMessage = `${packageHeader}\n${packageDetails}\n\n${message}`;
        }
      }
      await sendMessage(user.uid, creatorId, fullMessage, senderName, user.profileImageUrl || undefined);
      toast.success(t('toasts.success'));
      setMessageSent(true);
      setMessage('');
      
      // Show redirecting state after a brief success display
      setTimeout(() => {
        setRedirecting(true);
        setTimeout(() => {
          setMessageSent(false);
          onClose();
          router.replace(`/${locale}/dashboard/brand?tab=messages`);
        }, 200); // Reduced from 500ms to 200ms
      }, 400);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('toasts.error'));
      setMessageSent(false);
      setRedirecting(false);
    } finally {
      setSending(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md z-10 mx-4 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('title', { creatorName })}</h3>
        {trips && trips.length > 0 && (
          <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('tripSelection.label')}
            </label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-burgundy focus:ring-2 focus:ring-red-burgundy/20 transition-colors"
              value={selectedTripIndex ?? -1}
              onChange={(e) => setSelectedTripIndex(Number(e.target.value) === -1 ? null : Number(e.target.value))}
            >
                              <option value={-1}>{t('tripSelection.generalInquiry')}</option>
              {trips.map((trip, index) => (
                <option key={index} value={index}>
                  🛫 {trip.destination}, {trip.country} - {trip.dateRange}
                </option>
              ))}
            </select>
          </div>
        )}
        {trips && trips.length > 0 && selectedTripIndex !== null && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <span className="text-lg">🛫</span>
              <span className="font-medium text-sm">
                {t('tripContext.messagingAbout', {
                  destination: trips[selectedTripIndex || 0].destination,
                  dateRange: `${format(new Date(trips[selectedTripIndex || 0].startDate), 'MMM d')} – ${format(new Date(trips[selectedTripIndex || 0].endDate), 'MMM d, yyyy')}`
                })}
              </span>
            </div>
          </div>
        )}
        
        {/* Package Selection */}
        {packages && packages.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('packageSelection.label')}
            </label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-burgundy focus:ring-2 focus:ring-red-burgundy/20 transition-colors"
              value={selectedPackageIndex ?? -1}
              onChange={(e) => setSelectedPackageIndex(Number(e.target.value) === -1 ? null : Number(e.target.value))}
            >
              <option value={-1}>{t('packageSelection.generalInquiry')}</option>
              {packages.map((pkg, index) => (
                <option key={index} value={index}>
                  📦 {pkg.name} - PLN {pkg.price}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Package Context Display */}
        {packages && packages.length > 0 && selectedPackageIndex !== null && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-2 text-purple-800">
              <span className="text-lg">📦</span>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {packages[selectedPackageIndex || 0].name} - PLN {packages[selectedPackageIndex || 0].price}
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  {packages[selectedPackageIndex || 0].description}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {messageSent ? (
          <div className="text-green-600 font-semibold py-4 text-center">
            {redirecting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-green-600 border-r-transparent rounded-full animate-spin"></div>
                {t('success.redirecting')}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-600">✓</span>
                {t('success.title')}
              </div>
            )}
          </div>
        ) : (
          <>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 h-32 focus:border-red-burgundy focus:ring-2 focus:ring-red-burgundy/20 resize-none transition-colors"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('form.placeholder')}
            />
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors" 
                onClick={onClose}
                disabled={sending}
              >
                {t('form.cancel')}
              </button>
              <button 
                className="bg-red-burgundy text-white px-6 py-2 rounded-lg font-medium hover:bg-red-burgundy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleSend}
                disabled={sending || !message.trim()}
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin"></div>
                    {t('form.sending')}
                  </>
                ) : (
                  t('form.sendMessage')
                )}
              </button>
            </div>
          </>
        )}
      </Dialog.Panel>
    </Dialog>
  );
}

