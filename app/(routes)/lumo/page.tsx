'use client';

import { useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Footer from '@/app/components/ui/footer';

export default function LumoLandingPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Proszę podać swój adres email' });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Proszę podać prawidłowy adres email' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await addDoc(collection(db, 'waitlistEmails'), {
        email: email.trim(),
        createdAt: serverTimestamp(),
        source: 'lumo-landing'
      });

      setMessage({ type: 'success', text: 'Dziękujemy! Jesteś na liście oczekujących.' });
      setEmail('');
    } catch (error) {
      console.error('Error adding email to waitlist:', error);
      setMessage({ type: 'error', text: 'Coś poszło nie tak. Spróbuj ponownie.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center space-y-12">
            
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-red-burgundy/20 rounded-full">
              <div className="w-2 h-2 bg-red-burgundy rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-burgundy tracking-wide">
                OTRZYMUJ TREŚCI Z DOWOLNEGO MIEJSCA NA ŚWIECIE
              </span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-8xl xl:text-9xl font-serif font-bold text-red-burgundy leading-[0.9] tracking-tight hover:text-red-wine transition-colors duration-500">
                LUMO
              </h1>
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-serif text-text leading-tight max-w-4xl mx-auto">
                Zamawiaj i twórz autentyczne treści z całego świata
              </h2>
              <p className="text-xl text-subtext max-w-3xl mx-auto leading-relaxed">
                Lumo łączy marki z twórcami, którzy już planują podróże do miast, z których chcesz pozyskać treści na swoje social media. Zamów zdjęcia i wideo z konkretnych lokalizacji — zanim twórca jeszcze wsiądzie do samolotu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Do Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* For Brands */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-serif font-bold text-red-burgundy">
                  Dla marek
                </h2>
                <div className="w-20 h-1 bg-red-burgundy rounded-full"></div>
                <p className="text-lg text-subtext leading-relaxed">
                  Zamów treści z miejsca, zanim ktoś tam dotrze
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-burgundy/10 rounded-full flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-red-burgundy rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-text mb-1">Zobacz, kto jedzie do Twojej lokalizacji</p>
                    <p className="text-base text-subtext leading-relaxed">
                      Przeglądaj twórców według miasta i dat podróży
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-burgundy/10 rounded-full flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-red-burgundy rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-text mb-1">Zamów autentyczne materiały</p>
                    <p className="text-base text-subtext leading-relaxed">
                      Wideo i zdjęcia wykonane w konkretnym miejscu, zgodnie z Twoimi potrzebami
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-burgundy/10 rounded-full flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-red-burgundy rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-text mb-1">Otrzymuj treści bez opóźnień</p>
                    <p className="text-base text-subtext leading-relaxed">
                      Wynagrodzenie wypłacane dopiero po Twoim zatwierdzeniu contentu
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Creators */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-serif font-bold text-red-burgundy">
                  Dla twórców
                </h2>
                <div className="w-20 h-1 bg-red-burgundy rounded-full"></div>
                <p className="text-lg text-subtext leading-relaxed">
                  Zarabiaj na podróżach bez nachalnych ofert
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-burgundy/10 rounded-full flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-red-burgundy rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-text mb-1">Dodaj swoje nadchodzące wyjazdy</p>
                    <p className="text-base text-subtext leading-relaxed">
                      Miasta i daty — marki zobaczą Cię dokładnie wtedy, kiedy trzeba
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-burgundy/10 rounded-full flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-red-burgundy rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-text mb-1">Otrzymuj trafne oferty</p>
                    <p className="text-base text-subtext leading-relaxed">
                      Bez cold pitchu — tylko konkretne zapytania od zainteresowanych marek
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-burgundy/10 rounded-full flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-red-burgundy rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-text mb-1">Wynagrodzenie po akceptacji treści</p>
                    <p className="text-base text-subtext leading-relaxed">
                      Środki są bezpieczne i trafiają do Ciebie po zatwierdzeniu przez markę
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA Section */}
      <section className="py-24" style={{backgroundColor: '#FDFCF9'}}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-12">
            
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-red-burgundy">
                Otrzymaj dostęp do platformy jako pierwsza
              </h2>
              <p className="text-xl text-subtext max-w-2xl mx-auto leading-relaxed">
                Zgarnij pierwszeństwo — jako twórca zarabiaj i dostarczaj content z miejsc, w których właśnie jesteś, a jako marka zamawiaj treści szybciej i mądrzej. Autentyczny UGC — bez niepotrzebnych wiadomości i chaosu.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Podaj swój adres e-mail"
                  className="flex-1 px-6 py-4 border border-red-burgundy/20 rounded-2xl font-sans text-base focus:ring-2 focus:ring-red-burgundy/20 focus:border-red-burgundy outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative inline-flex items-center gap-3 bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-red-burgundy disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-burgundy/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative">
                    {isSubmitting ? 'Dołączanie...' : 'Dołącz teraz'}
                  </span>
                  {!isSubmitting && (
                    <svg className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Success/Error Message */}
              {message && (
                <div className={`mt-6 p-4 rounded-2xl font-sans text-sm border ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} // review trigger
