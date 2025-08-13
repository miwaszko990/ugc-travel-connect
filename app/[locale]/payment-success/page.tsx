'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/auth';
import { useLocale } from 'next-intl';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('payments.success');
  const locale = useLocale();
  const [countdown, setCountdown] = useState(3);

  // Keep these commented but available for future webhook implementation
  // const sessionId = searchParams.get('session_id');
  // const offerId = searchParams.get('offer_id');
  // const creatorId = searchParams.get('creator_id');
  // const brandId = searchParams.get('brand_id');

  useEffect(() => {
    // Debug logging
    console.log('Payment Success - User:', user);
    console.log('Payment Success - User Role:', user?.role);
    
    // Countdown timer and redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Simple redirect to dashboard messages
          if (user?.role === 'brand') {
            router.push(`/${locale}/dashboard/brand?tab=bookings`);
          } else {
            router.push(`/${locale}/dashboard/creator?tab=earnings`);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, user, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-[24px] shadow-lg border border-gray-100 p-8">
          
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              {t('title')}
            </h1>
            
            <p className="text-lg text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: t('subtitle') }}>
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-gray-50 rounded-[16px] p-6 mb-8">
            <h2 className="text-xl font-serif font-semibold text-gray-900 mb-6">{t('whatHappensNext')}</h2>
            
            {user?.role === 'brand' ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-burgundy text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('brand.step1.title')}</h3>
                    <p className="text-gray-600">{t('brand.step1.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-burgundy text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('brand.step2.title')}</h3>
                    <p className="text-gray-600">{t('brand.step2.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-burgundy text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('brand.step3.title')}</h3>
                    <p className="text-gray-600">{t('brand.step3.description')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('creator.step1.title')}</h3>
                    <p className="text-gray-600">{t('creator.step1.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('creator.step2.title')}</h3>
                    <p className="text-gray-600">{t('creator.step2.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('creator.step3.title')}</h3>
                    <p className="text-gray-600">{t('creator.step3.description')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Auto redirect message */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">
              {t('redirecting', { countdown })}
            </p>
          </div>

          {/* Manual redirect button */}
          <div className="text-center">
            <button
              onClick={() => router.push(`/${locale}/dashboard/brand?tab=bookings`)}
              className="bg-red-burgundy hover:bg-red-burgundy/90 text-white font-semibold px-8 py-3 rounded-[12px] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {t('goToDashboard')}
            </button>
          </div>
          
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
