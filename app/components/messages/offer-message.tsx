'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Message } from '@/app/lib/firebase/messages';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { createCheckoutSession, redirectToCheckout } from '@/app/lib/stripe-client';
import { auth } from '@/app/lib/firebase';

interface OfferMessageProps {
  message: Message;
  isFromUser: boolean;
  currentUserRole: 'brand' | 'creator';
  currentUserId: string;
  otherUserId: string;
  onAccept: (offerId: string) => Promise<void>;
  onReject: (offerId: string) => Promise<void>;
}

export default function OfferMessage({ 
  message, 
  isFromUser, 
  currentUserRole,
  currentUserId,
  otherUserId,
  onAccept,
  onReject 
}: OfferMessageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const t = useTranslations('brand.messaging.offerMessage');
  const tPackages = useTranslations('brand.messaging.offerModal.packages');
  const tPackages = useTranslations('brand.messaging.offerModal.packages');
  
  // Helper function to safely convert timestamps to Date objects
  const toSafeDate = (timestamp: any): Date => {
    if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  };
  
  const timestamp = toSafeDate(message.sentAt);
  const tPackages = useTranslations('brand.messaging.offerModal.packages');
  
  // Function to translate package descriptions dynamically
  const getTranslatedDescription = (description: string): string => {
    // Check if description contains package ID prefix
    const packageMatch = description.match(/^\[PACKAGE:(\w+)\]/);
    if (packageMatch) {
      const packageId = packageMatch[1];
      // Map package IDs to translation keys
      const packageKeyMap: Record<string, string> = {
        'mini': 'mini.description',
        'content': 'content.description', 
        'full': 'full.description'
      };
      
      const translationKey = packageKeyMap[packageId];
      if (translationKey) {
        return tPackages(translationKey);
      }
      
      // Fallback: return description without the prefix
      return description.replace(/^\[PACKAGE:\w+\]/, '').trim();
    }
    
    // Return original description for custom offers
    return description;
  };
  
  if (!message.trip || !message.description || !message.price) {
    return null;
  }

  const handleAccept = async () => {
    if (!message.offerId || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onAccept(message.offerId);
    } catch (error) {
      console.error('Error accepting offer:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async () => {
    if (!message.offerId || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onReject(message.offerId);
    } catch (error) {
      console.error('Error rejecting offer:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayNow = async () => {
    if (!message.offerId || !message.trip || !message.price || isPaymentProcessing) return;

    setIsPaymentProcessing(true);
    try {
      // Verify authentication state before proceeding
      if (!auth.currentUser) {
        throw new Error('Authentication expired. Please try again.');
      }
      
      const checkoutData = {
        offerId: message.offerId,
        creatorId: currentUserRole === 'brand' ? otherUserId : currentUserId,
        brandId: currentUserRole === 'brand' ? currentUserId : otherUserId,
        amount: message.price,
        tripDestination: message.trip.destination,
        tripCountry: message.trip.country,
      };

      const { url } = await createCheckoutSession(checkoutData) as { url: string };
      await redirectToCheckout(url);
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      
      // Handle authentication errors specifically
      if (error.message && (error.message.includes('Authentication expired') || error.message.includes('authenticated') || error.message.includes('log in'))) {
        // Show retry option instead of auto-refresh
        const retry = window.confirm('Authentication session expired. Would you like to retry the payment?');
        if (retry) {
          // Wait a moment and retry
          setTimeout(() => {
            handlePayNow();
          }, 1000);
        }
        return;
      }
      
      // Show specific error message based on error type
      let errorMessage = 'Failed to initiate payment. Please try again.';
      
      if (error.message) {
        if (error.message.includes('permission')) {
          errorMessage = 'You do not have permission to make payments. Please contact support.';
        } else if (error.message.includes('Invalid') || error.message.includes('argument')) {
          errorMessage = 'Invalid payment information. Please refresh the page and try again.';
        } else if (error.message.includes('unavailable') || error.message.includes('internal')) {
          errorMessage = 'Payment service is temporarily unavailable. Please try again in a few minutes.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const getStatusDisplay = () => {
    switch (message.offerStatus) {
      case 'accepted':
        return { 
          textColor: 'text-green-600', 
          bgColor: 'bg-green-50', 
          borderColor: 'border-green-200',
          text: t('status.accepted') 
        };
      case 'rejected':
        return { 
          textColor: 'text-red-600', 
          bgColor: 'bg-red-50', 
          borderColor: 'border-red-200',
          text: t('status.rejected') 
        };
      case 'paid':
        return {
          textColor: 'text-blue-700', 
          bgColor: 'bg-blue-50', 
          borderColor: 'border-blue-200',
          text: t('status.paid')
        };
      default:
        return {
          textColor: 'text-yellow-700', 
          bgColor: 'bg-yellow-50', 
          borderColor: 'border-yellow-200',
          text: t('status.pending')
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const showActionButtons = currentUserRole === 'creator' && 
                           !isFromUser && 
                           message.offerStatus === 'pending';
  
  const showPayButton = currentUserRole === 'brand' && 
                       isFromUser && 
                       message.offerStatus === 'accepted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-sm lg:max-w-md rounded-2xl border-2 ${
        isFromUser 
          ? 'bg-red-burgundy text-white border-red-burgundy' 
          : 'bg-white text-gray-900 border-gray-200'
      }`}>
        {/* Offer Header */}
        <div className={`px-4 py-3 border-b ${
          isFromUser ? 'border-red-burgundy/20' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">💼</span>
                              <span className="font-semibold">{t('title')}</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.textColor} ${statusDisplay.bgColor} ${statusDisplay.borderColor} border`}>
              {statusDisplay.text}
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="px-4 py-3 space-y-3">
          <div>
            <h4 className={`font-medium ${isFromUser ? 'text-white' : 'text-gray-900'}`}>
              📍 {message.trip.destination}
            </h4>
            <p className={`text-sm ${isFromUser ? 'text-white font-medium' : 'text-gray-600'}`}>
              {format(toSafeDate(message.trip.startDate), 'MMM d')} - {format(toSafeDate(message.trip.endDate), 'MMM d, yyyy')}
            </p>
          </div>

          <div>
            <h5 className={`font-medium text-sm ${isFromUser ? 'text-white' : 'text-gray-900'}`}>
              {t('taskDescription')}
            </h5>
            <p className={`text-sm ${isFromUser ? 'text-white font-medium' : 'text-gray-600'} leading-relaxed`}>
              {getTranslatedDescription(message.description)}
            </p>
          </div>

          <div>
            <span className={`text-lg font-bold ${isFromUser ? 'text-white' : 'text-gray-900'}`}>
              ${message.price.toLocaleString()} USD
            </span>
          </div>

          {/* Payment Info for Paid Offers */}
          {message.offerStatus === 'paid' && message.paymentData && (
            <div className={`text-sm ${isFromUser ? 'text-red-burgundy/70' : 'text-gray-600'}`}>
              <p>{t('payment.paid').replace('${amount}', message.paymentData.amountPaid.toLocaleString())}</p>
              <p>{t('payment.date').replace('{date}', format(
                toSafeDate(message.paymentData.paidAt), 
                'MMM d, yyyy'
              ))}</p>
            </div>
          )}
        </div>

        {/* Action Buttons - Accept/Reject for Creators */}
        {showActionButtons && (
          <div className="px-4 py-3 border-t border-gray-200 space-y-2">
            <div className="flex space-x-2">
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? t('buttons.processing') : t('buttons.accept')}
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? t('buttons.processing') : t('buttons.reject')}
              </button>
            </div>
          </div>
        )}

        {/* Pay Now Button for Brands */}
        {showPayButton && (
          <div className="px-4 py-3 border-t border-red-burgundy/20">
            <button
              onClick={handlePayNow}
              disabled={isPaymentProcessing}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isPaymentProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('buttons.processing')}</span>
                </>
              ) : (
                <>
                  <span>💳</span>
                  <span>{t('buttons.payNow')} - ${message.price.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Timestamp and Status */}
        <div className={`px-4 py-2 border-t ${
          isFromUser ? 'border-red-burgundy/20' : 'border-gray-200'
        }`}>
          <div className={`flex items-center justify-between ${
            isFromUser ? 'text-red-burgundy/70' : 'text-gray-500'
          }`}>
            <p className="text-xs">
              {format(timestamp, 'MMM d, h:mm a')}
            </p>
            {isFromUser && (
              <div className="flex items-center space-x-1">
                {/* Show double checkmarks for read messages, single for delivered */}
                {message.status === 'read' ? (
                  <div className="flex">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <svg className="w-3 h-3 text-white -ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
} // review trigger
