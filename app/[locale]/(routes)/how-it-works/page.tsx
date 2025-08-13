"use client";

import { useTranslations } from 'next-intl';
import Navigation from '@/app/components/ui/navigation';
import Footer from '@/app/components/ui/footer';
import HowItWorks from '@/app/components/ui/how-it-works';

export default function HowItWorksPage() {
  const t = useTranslations('root');

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navigation sticky={true} />
      
      {/* Page Header */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-ivory to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-burgundy/10 backdrop-blur-sm border border-red-burgundy/20 rounded-full mb-6">
              <div className="w-2 h-2 bg-red-burgundy rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-burgundy tracking-wide uppercase">
                {t('howItWorks.badge')}
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-serif font-bold text-red-burgundy mb-6 leading-tight">
              {t('howItWorks.title')}
            </h1>
            <p className="text-xl text-subtext max-w-4xl mx-auto leading-relaxed">
              {t('howItWorks.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Component */}
      <HowItWorks />
      
      <Footer />
    </div>
  );
} 