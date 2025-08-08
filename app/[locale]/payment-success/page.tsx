'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userRole } = useAuth();
  const [countdown, setCountdown] = useState(3);

  // Keep these commented but available for future webhook implementation
  // const sessionId = searchParams.get('session_id');
  // const offerId = searchParams.get('offer_id');
  // const creatorId = searchParams.get('creator_id');
  // const brandId = searchParams.get('brand_id');

  useEffect(() => {
    // Countdown timer and redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Simple redirect to dashboard messages
          if (userRole === 'brand') {
            router.push('/dashboard/brand?tab=messages');
          } else {
            router.push('/dashboard/creator?tab=orders');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, userRole]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            Your payment has been processed successfully. The funds are being held in escrow until the content is delivered.
          </p>

          {/* Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
            
            {userRole === 'brand' ? (
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <p className="text-gray-700">The creator will be notified of your payment</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <p className="text-gray-700">They will create and deliver your content</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <p className="text-gray-700">You can mark the order as complete to release payment</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <p className="text-gray-700">You have a new paid order waiting</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <p className="text-gray-700">Create and deliver the requested content</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <p className="text-gray-700">Get paid when the brand marks it complete</p>
                </div>
              </div>
            )}
          </div>

          {/* Auto redirect message */}
          <p className="text-sm text-gray-500 mb-6">
            Redirecting you back to your dashboard in {countdown} seconds...
          </p>

          {/* Manual redirect button */}
          <button
            onClick={() => {
              if (userRole === 'brand') {
                router.push('/dashboard/brand?tab=messages');
              } else {
                router.push('/dashboard/creator?tab=orders');
              }
            }}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
} // review trigger
