"use client";

import Navigation from '@/app/components/ui/navigation';
import Footer from '@/app/components/ui/footer';
import HowItWorks from '@/app/components/ui/how-it-works';

export default function HowItWorksPage() {

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navigation sticky={true} />
      
      {/* How It Works Component */}
      <HowItWorks />
      
      <Footer />
    </div>
  );
} 