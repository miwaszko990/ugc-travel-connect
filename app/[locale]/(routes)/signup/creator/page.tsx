'use client';

import Footer from '@/app/components/ui/footer';

export default function CreatorSignupPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: '#FDFCF9'}}>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Sophisticated Background Pattern */}
        <div className="absolute inset-0">
          {/* Subtle dot pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 0, 0, 0.4) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          
          {/* Elegant gradient overlays */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-red-burgundy/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-red-burgundy/3 to-transparent rounded-full blur-2xl"></div>
          
          {/* Minimal geometric accents */}
          <div className="absolute top-1/4 right-1/4 w-px h-32 bg-gradient-to-b from-transparent via-red-burgundy/20 to-transparent"></div>
          <div className="absolute bottom-1/3 left-1/4 w-24 h-px bg-gradient-to-r from-transparent via-red-burgundy/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center space-y-8">
            
            {/* Main Heading */}
            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-serif font-bold text-red-burgundy leading-tight tracking-tight hover:text-red-wine transition-colors duration-500">
              Formularz Twórcy
            </h1>
            
            {/* Coming Soon Message */}
            <div className="bg-white/80 backdrop-blur-sm border border-red-burgundy/20 rounded-2xl p-8 shadow-xl">
              <p className="text-2xl lg:text-3xl font-serif text-text mb-4">
                Wkrótce
              </p>
              <p className="text-lg text-subtext leading-relaxed">
                Pracujemy nad formularzem rejestracji dla twórców. Już wkrótce będziesz mógł dołączyć do platformy LUMO i zarabiać na swoich podróżach.
              </p>
            </div>
            
            {/* Back to Home Button */}
            <div className="pt-4">
              <a
                href="/pl/lumo"
                className="group relative inline-flex items-center justify-center gap-3 bg-red-burgundy text-white hover:bg-red-wine px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative">← Powrót do LUMO</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
