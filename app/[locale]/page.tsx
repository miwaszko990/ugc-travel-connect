'use client';
import Footer from '@/app/components/ui/footer';
import Image from 'next/image';
import { MagnifyingGlassIcon, FilmIcon, BoltIcon, CalendarDaysIcon, EnvelopeIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from 'react';
import CountdownEarlyAccess from '@/app/components/CountdownEarlyAccess';

export default function HomePage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const [resolvedSearchParams, setResolvedSearchParams] = useState<{ ok?: string }>({});
  
  useEffect(() => {
    searchParams.then(params => setResolvedSearchParams(params));
  }, [searchParams]);
  const [quickSignupState, setQuickSignupState] = useState<{
    email: string;
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({
    email: '',
    loading: false,
    success: false,
    error: null,
  });

  const [creatorQuickSignupState, setCreatorQuickSignupState] = useState<{
    email: string;
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({
    email: '',
    loading: false,
    success: false,
    error: null,
  });

  const handleQuickSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickSignupState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Save to database
      const response = await fetch('/api/quick-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: quickSignupState.email,
          role: 'brand',
          source: 'landing_quick_signup',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setQuickSignupState(prev => ({ 
        ...prev, 
        loading: false, 
        success: true 
      }));
    } catch (error) {
      setQuickSignupState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Coś poszło nie tak. Spróbuj ponownie.' 
      }));
    }
  };

  const handleCreatorQuickSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatorQuickSignupState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Save to database
      const response = await fetch('/api/quick-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: creatorQuickSignupState.email,
          role: 'creator',
          source: 'landing_quick_signup_creator',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setCreatorQuickSignupState(prev => ({ 
        ...prev, 
        loading: false, 
        success: true 
      }));
    } catch (error) {
      setCreatorQuickSignupState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Coś poszło nie tak. Spróbuj ponownie.' 
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: '#FDFCF9'}}>
      
      {/* Logo Header */}
      <div className="pt-6 pl-6">
        <div className="flex items-center">
          <div className="relative">
            <span className="text-3xl font-serif font-bold text-[#8D2D26] hover:text-red-wine transition-all duration-300 transform hover:scale-105">
              Lumo
            </span>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8D2D26] hover:w-full transition-all duration-300"></div>
          </div>
          <span className="ml-3 text-sm font-medium text-neutral-600 hidden sm:block tracking-wide uppercase">
            TRAVEL CONNECT
          </span>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-center">
          <div className="space-y-5 md:space-y-7">
            
            {/* Main Heading */}
            <h1 className="mx-auto max-w-2xl text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-[-0.01em] text-[#8D2D26]">
              Autentyczne treści z dowolnego miejsca na świecie.
            </h1>
            
            {/* Subheading */}
            <p className="mx-auto max-w-xl text-base md:text-lg text-neutral-600">
            Jako Twórca zarabiaj i dostarczaj content z miejsc, w których właśnie jesteś, a jako Marka zamawiaj treści szybciej i wygodniej.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 pt-1">
              <a 
                href="#creator-signup" 
                aria-label="Przejdź do formularza Twórcy"
                className="inline-flex items-center rounded-2xl px-6 md:px-7 py-3 bg-[#8D2D26] text-white hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D2D26]"
              >
                Jestem Twórcą
              </a>
              <a 
                href="#brand-signup" 
                aria-label="Przejdź do formularza Marki"
                className="inline-flex items-center rounded-2xl px-6 md:px-7 py-3 border border-[#8D2D26]/30 text-[#8D2D26] hover:bg-[#8D2D26]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D2D26]"
              >
                Jestem Marką
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Early Access Section */}
      <CountdownEarlyAccess />

      {/* For Creators Section */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-[#8D2D26] text-left">Dla Twórców</h2>
          <div className="mt-2 text-neutral-600">Zarabiaj na podróżach akceptując konkretne zlecenia.</div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            <div className="rounded-2xl border border-neutral-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex justify-center">
                <CalendarDaysIcon className="h-8 w-8 md:h-10 md:w-10 text-[#8D2D26]" aria-hidden="true" />
        </div>
              <h3 className="mt-3 text-base md:text-lg font-semibold tracking-[-0.01em]">Dodaj swoje podróże </h3>
              <p className="mt-1.5 text-sm md:text-[15px] leading-relaxed text-neutral-600 max-w-[30ch]">
              Pokaż dokąd jedziesz - skontaktują sie z Tobą Marki, które są zainteresowane contentem z konkretnego miejsca. 
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex justify-center">
                <EnvelopeIcon className="h-8 w-8 md:h-10 md:w-10 text-[#8D2D26]" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base md:text-lg font-semibold tracking-[-0.01em]">Dostajesz tylko dopasowane oferty</h3>
              <p className="mt-1.5 text-sm md:text-[15px] leading-relaxed text-neutral-600 max-w-[30ch]">
                Żadnego spamu - tylko konkretne zlecenia od Marek, które naprawdę chcą z Tobą współpracować.
              </p>
            </div>
            
            <div className="rounded-2xl border border-neutral-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex justify-center">
                <BanknotesIcon className="h-8 w-8 md:h-10 md:w-10 text-[#8D2D26]" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base md:text-lg font-semibold tracking-[-0.01em]"> Bezpieczna wypłata</h3>
              <p className="mt-1.5 text-sm md:text-[15px] leading-relaxed text-neutral-600 max-w-[30ch]">
                Twoje wynagrodzenie trafia do Ciebie automatycznie po zaakceptowaniu treści przez Markę.
              </p>
            </div>
          </div>

          <a href="#creator-signup" className="inline-flex items-center rounded-2xl border border-[#8D2D26]/30 text-[#8D2D26] hover:bg-[#8D2D26]/5 px-5 py-2 mt-8">
            Dołącz jako Twórca →
          </a>
        </div>
      </section>

      {/* Creator Quick Signup Section */}
      <section id="creator-signup" className="py-16 md:py-20 bg-gradient-to-br from-[#8D2D26]/5 to-[#8D2D26]/10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-[#8D2D26]">
            Chcesz dostawać płatne zlecenia w miastach, do których jedziesz?
          </h2>
          <p className="mt-3 text-base md:text-lg text-neutral-600 max-w-xl mx-auto">
            Zostaw swój e-mail i otrzymaj dostęp do platformy jako pierwsza.
          </p>

          {creatorQuickSignupState.success ? (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 text-green-800 px-6 py-4 max-w-md mx-auto">
              <p className="font-medium">Dziękujemy!</p>
              <p className="text-sm mt-1">Wyślemy Ci pierwsze oferty w ciągu 24 godzin.</p>
            </div>
          ) : (
            <form onSubmit={handleCreatorQuickSignup} className="mt-8 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={creatorQuickSignupState.email}
                  onChange={(e) => setCreatorQuickSignupState(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="twoj@email.com"
                  required
                  disabled={creatorQuickSignupState.loading}
                  className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={creatorQuickSignupState.loading || !creatorQuickSignupState.email}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#8D2D26] px-6 py-3 text-white hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D2D26] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {creatorQuickSignupState.loading ? 'Wysyłanie...' : 'Otrzymaj oferty'}
                </button>
              </div>
              
              {creatorQuickSignupState.error && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                  {creatorQuickSignupState.error}
                </div>
              )}
              
              <p className="mt-4 text-sm text-neutral-600">
                Wolę pełną rejestrację →{' '}
                <a 
                  href="#creator-form" 
                  className="text-[#8D2D26] hover:underline font-medium"
                >
                  formularz twórcy
                </a>
              </p>
            </form>
          )}
        </div>
      </section>

      {/* For Brands Section */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-[#8D2D26] text-left">Dla Marek</h2>
          <div className="mt-2 text-neutral-600">Zamów treści z miejsca, zanim ktoś tam dotrze.</div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            <div className="rounded-2xl border border-neutral-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex justify-center">
                <MagnifyingGlassIcon className="h-8 w-8 md:h-10 md:w-10 text-[#8D2D26]" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base md:text-lg font-semibold tracking-[-0.01em]">Zobacz, kto będzie w Twojej lokalizacji</h3>
              <p className="mt-1.5 text-sm md:text-[15px] leading-relaxed text-neutral-600 max-w-[30ch]">
                Przeglądaj Twórców według miasta i dat podróży.
                </p>
              </div>
              
            <div className="rounded-2xl border border-neutral-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex justify-center">
                <FilmIcon className="h-8 w-8 md:h-10 md:w-10 text-[#8D2D26]" aria-hidden="true" />
                  </div>
              <h3 className="mt-3 text-base md:text-lg font-semibold tracking-[-0.01em]">Zamów autentyczne materiały</h3>
              <p className="mt-1.5 text-sm md:text-[15px] leading-relaxed text-neutral-600 max-w-[30ch]">
                Wideo i zdjęcia wykonane w konkretnym miejscu, zgodnie z briefem.
              </p>
                </div>
                
            <div className="rounded-2xl border border-neutral-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex justify-center">
                <BoltIcon className="h-8 w-8 md:h-10 md:w-10 text-[#8D2D26]" aria-hidden="true" />
                  </div>
              <h3 className="mt-3 text-base md:text-lg font-semibold tracking-[-0.01em]">Odbierz treści szybko i bezpiecznie</h3>
              <p className="mt-1.5 text-sm md:text-[15px] leading-relaxed text-neutral-600 max-w-[30ch]">
                 Środki trafiają do Twórcy po akceptacji — bez zbędnych opóźnień.
                    </p>
                  </div>
                </div>
                
          <a href="#brand-signup" className="inline-flex items-center rounded-2xl border border-[#8D2D26]/30 text-[#8D2D26] hover:bg-[#8D2D26]/5 px-5 py-2 mt-8">
            Dołącz jako Marka →
          </a>
                  </div>
      </section>

      {/* Brand Quick Signup Section */}
      <section id="brand-signup" className="py-16 md:py-20 bg-gradient-to-br from-[#8D2D26]/5 to-[#8D2D26]/10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-[#8D2D26]">
            Chcesz zobaczyć dostępnych twórców?
          </h2>
          <p className="mt-3 text-base md:text-lg text-neutral-600 max-w-xl mx-auto">
            Zostaw swój email i otrzymaj dostęp do platformy jako pierwsza.
          </p>

          {quickSignupState.success ? (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 text-green-800 px-6 py-4 max-w-md mx-auto">
              <p className="font-medium">Dziękujemy!</p>
              <p className="text-sm mt-1">Wyślemy Ci dostęp w ciągu 24 godzin.</p>
            </div>
          ) : (
            <form onSubmit={handleQuickSignup} className="mt-8 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={quickSignupState.email}
                  onChange={(e) => setQuickSignupState(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="twoj@email.com"
                  required
                  disabled={quickSignupState.loading}
                  className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={quickSignupState.loading || !quickSignupState.email}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#8D2D26] px-6 py-3 text-white hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D2D26] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {quickSignupState.loading ? 'Wysyłanie...' : 'Uzyskaj dostęp'}
                </button>
              </div>
              
              {quickSignupState.error && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                  {quickSignupState.error}
                </div>
              )}
              
              <p className="mt-4 text-sm text-neutral-600">
                Wolę pełną rejestrację →{' '}
                <a 
                  href="#brand-form" 
                  className="text-[#8D2D26] hover:underline font-medium"
                >
                  formularz marki
                </a>
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 md:py-20 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-[#8D2D26]">
            Tak to wygląda w praktyce
          </h2>
          <p className="mt-3 text-base md:text-lg text-neutral-600 text-center mx-auto max-w-2xl">
            Zobacz jakie funkcje są dostępne na platformie.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Screenshot 1 - Profile */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="relative">
                <Image
                  src="/images/demo/profilee.png"
                  alt="Profil twórcy z nadchodzącymi wyjazdami"
                  width={400}
                  height={300}
                  className="w-full h-auto"
                  priority={false}
                />
                  </div>
              <div className="p-4">
                <p className="text-sm text-neutral-600 text-center">
                  Twórcy dodają swoje nadchodzące wyjazdy — Marki widzą, kto będzie w danym miejscu i kiedy.
                </p>
              </div>
            </div>

            {/* Screenshot 2 - Packages Calendar */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="relative">
                <Image
                  src="/images/demo/packages-calendaar.png"
                  alt="Pakiety i kalendarz dostępności"
                  width={400}
                  height={300}
                  className="w-full h-auto"
                  priority={false}
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-neutral-600 text-center">
                  Marki mogą sprawdzić dostępność i przejrzeć pakiety z cenami oraz zakresem contentu.
                    </p>
                  </div>
                </div>
                
            {/* Screenshot 3 - Message */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="relative">
                <Image
                  src="/images/demo/messagee.png"
                  alt="Wiadomości między marką a twórcą"
                  width={400}
                  height={300}
                  className="w-full h-auto"
                  priority={false}
                />
                  </div>
              <div className="p-4">
                <p className="text-sm text-neutral-600 text-center">
                  Wystarczy wybrać termin, pakiet i wysłać wiadomość — współpraca startuje od razu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Form Section - HIDDEN FOR NOW (keep for future use) */}
      <section id="creator-form" className="py-16 md:py-20 hidden">{/* TEMPORARILY HIDDEN */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em]">Dołącz jako Twórca</h2>
          
          {/* Success Alert */}
          {resolvedSearchParams.ok === "creator" && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 text-green-800 px-4 py-3">
              Dziękujemy! Zgłoszenie Twórcy zapisane. Odezwiemy się z dostępem do bety.
            </div>
          )}
          
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white/70 shadow-sm p-5 md:p-6">
            <form method="post" action="/api/waitlist/creator" className="grid grid-cols-1 gap-5">
              <label className="block">
                <span className="block text-sm font-medium mb-1.5">Imię i nazwisko *</span>
                <input name="fullName" required className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="block text-sm font-medium mb-1.5">E-mail *</span>
                  <input type="email" name="email" required className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium mb-1.5">Instagram (nick) *</span>
                  <input name="instagram" required placeholder="@twoj_nick" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                </label>
              </div>
              <label className="block">
                <span className="block text-sm font-medium mb-1.5">Liczba obserwujących</span>
                <input type="number" name="followers" min={0} className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
              </label>

              {/* Trips (3 slots) */}
              <div className="mt-1 rounded-2xl border border-neutral-200 bg-white/60 p-4 md:p-5">
                <div className="text-sm font-medium mb-3">Najbliższe podróże (maks. 3)</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Miasto</div>
                  <input name="trip_city[]" placeholder="Miasto" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Od kiedy</div>
                    <input type="date" name="trip_from[]" placeholder="dd-mm-rrrr (od)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Do kiedy</div>
                    <input type="date" name="trip_to[]" placeholder="dd-mm-rrrr (do)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Miasto</div>
                  <input name="trip_city[]" placeholder="Miasto" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Od kiedy</div>
                    <input type="date" name="trip_from[]" placeholder="dd-mm-rrrr (od)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Do kiedy</div>
                    <input type="date" name="trip_to[]" placeholder="dd-mm-rrrr (do)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Miasto</div>
                  <input name="trip_city[]" placeholder="Miasto" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Od kiedy</div>
                    <input type="date" name="trip_from[]" placeholder="dd-mm-rrrr (od)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Do kiedy</div>
                    <input type="date" name="trip_to[]" placeholder="dd-mm-rrrr (do)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-neutral-500">Pozostaw puste wiersze, jeśli niepotrzebne.</p>
              </div>

              <label className="inline-flex items-start gap-3 text-sm mt-2">
                <input type="checkbox" name="consent" required className="size-4 rounded border-neutral-300 text-[#8D2D26] focus:ring-[#8D2D26]/30" />
                <span>Wyrażam zgodę na przetwarzanie danych zgodnie z <a href="/polityka-prywatnosci" className="underline">Polityką Prywatności</a> i akceptuję <a href="/regulamin" className="underline">Regulamin</a>. *</span>
              </label>

              <button className="mt-3 inline-flex items-center justify-center rounded-2xl bg-[#8D2D26] px-6 py-3 text-white hover:opacity-95 transition w-full md:w-auto">Wyślij zgłoszenie</button>
            </form>
          </div>
        </div>
      </section>

      {/* Brand Form Section - HIDDEN FOR NOW (keep for future use) */}
      <section id="brand-form" className="py-16 md:py-20 hidden">{/* TEMPORARILY HIDDEN */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em]">Dołącz jako Marka</h2>
          
          {/* Success Alert */}
          {resolvedSearchParams.ok === "brand" && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 text-green-800 px-4 py-3">
              Dziękujemy! Zgłoszenie Marki zapisane. Odezwiemy się z dostępem do bety.
            </div>
          )}
          
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white/70 shadow-sm p-5 md:p-6">
            <form method="post" action="/api/waitlist/brand" className="grid grid-cols-1 gap-5">
              <label className="block">
                <span className="block text-sm font-medium mb-1.5">Nazwa marki *</span>
                <input name="brandName" required className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="block text-sm font-medium mb-1.5">E-mail *</span>
                  <input type="email" name="email" required className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium mb-1.5">Instagram / strona www *</span>
                  <input name="websiteOrIg" required placeholder="@brand / https://…" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                </label>
              </div>

              {/* Requests (3 slots) */}
              <div className="mt-1 rounded-2xl border border-neutral-200 bg-white/60 p-4 md:p-5">
                <div className="text-sm font-medium mb-1">Lokalizacje i okna czasowe (maks. 3)</div>
                <div className="text-xs text-neutral-500 mb-3">Skąd potrzebujesz contentu? Podaj miasta i daty. Kliknij w pole daty, aby wybrać z kalendarza.</div>
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Miasto</div>
                  <input name="req_city[]" placeholder="Miasto" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Od kiedy</div>
                    <input type="date" name="req_from[]" placeholder="dd-mm-rrrr (od)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Do kiedy</div>
                    <input type="date" name="req_to[]" placeholder="dd-mm-rrrr (do)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Miasto</div>
                  <input name="req_city[]" placeholder="Miasto" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Od kiedy</div>
                    <input type="date" name="req_from[]" placeholder="dd-mm-rrrr (od)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Do kiedy</div>
                    <input type="date" name="req_to[]" placeholder="dd-mm-rrrr (do)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Miasto</div>
                  <input name="req_city[]" placeholder="Miasto" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Od kiedy</div>
                    <input type="date" name="req_from[]" placeholder="dd-mm-rrrr (od)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Do kiedy</div>
                    <input type="date" name="req_to[]" placeholder="dd-mm-rrrr (do)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  </div>
                </div>

              </div>

              <label className="inline-flex items-start gap-3 text-sm mt-2">
                <input type="checkbox" name="consent" required className="size-4 rounded border-neutral-300 text-[#8D2D26] focus:ring-[#8D2D26]/30" />
                <span>Wyrażam zgodę na przetwarzanie danych zgodnie z <a href="/polityka-prywatnosci" className="underline">Polityką Prywatności</a> i akceptuję <a href="/regulamin" className="underline">Regulamin</a>. *</span>
              </label>

              <button className="mt-3 inline-flex items-center justify-center rounded-2xl bg-[#8D2D26] px-6 py-3 text-white hover:opacity-95 transition w-full md:w-auto">Wyślij zgłoszenie</button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl md:text-4xl font-semibold tracking-[-0.01em] text-[#8D2D26]">FAQ</h2>
          <p className="mt-3 text-base md:text-lg text-neutral-600 text-center mx-auto max-w-2xl">
            Najczęstsze pytania od marek i twórców — krótko i konkretnie.
          </p>

          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {[
              { q: "Co to jest Lumo?", a: "LUMO łączy Marki z Twórcami, którzy podróżują do konkretnych miejsc. Jako Twórca zarabiaj i dostarczaj content z miejsc, w których właśnie jesteś, a jako Marka zamawiaj treści szybciej i wygodniej." },
              { q: "Czy to działa tylko latem?", a: "Nie. Twórcy podróżują cały rok — city breaki, delegacje, narty, festiwale. Zlecenia są realizowane niezależnie od sezonu." },
              { q: "Jak działa płatność i bezpieczeństwo?", a: "Marka opłaca zlecenie z góry, środki zostają zabezpieczone przez naszą platformę. Wypłata dla Twórcy następuje po akceptacji materiałów przez Markę." },
              { q: "Ile to kosztuje?", a: "Rejestracja jest bezpłatna. Budżet za content ustalacie między sobą według pakietów Twórcy." },
              { q: "Czy muszę mieć dużą liczbę obserwujących, by zostać Twórcą?", a: "Nie. Liczy się umiejętność tworzenia autentycznych materiałów i dostępność w danej lokalizacji/terminie." },
              { q: "Co, jeśli termin nagle się zmieni?", a: "Przy zmianach dat skontaktujcie się przez chat i ustalcie nowy termin. W razie potrzeby można anulować/zmodyfikować zlecenie zgodnie z ustaleniami." },
              { q: "Jak szybko dostanę materiały?", a: "Standard: 48–72h od nagrania/zdjęć. Ekspres (24h) bywa możliwy — zależy od pakietu i dostępności Twórcy." },
              { q: "Czy mogę zobaczyć dostępnych twórców w konkretnej lokalizacji?", a: "Tak. Twórcy publikują nadchodzące wyjazdy (miasto + daty), więc Marki widzą, kto będzie na miejscu w danym czasie." },
              { q: "Jak wygląda kontakt z Twórcą?", a: "Marka wysyła brief i wiadomość do wybranego Twórcy z zapytaniem o współpracę. Szczegóły, terminy i pakiet ustalacie w wiadomościach prywatnych." },
              { q: "Czy istnieje możliwość wystawienia faktury?", a: "Rozliczenie odbywa się przez operatora płatności Stripe. Faktury/rachunki wystawiane są zgodnie z danymi podanymi w profilu Marki." },
              { q: "Co z prywatnością i danymi?", a: "Dane przetwarzamy wyłącznie w celu realizacji współpracy zgodnie z Polityką Prywatności i RODO. Masz pełną kontrolę nad swoim profilem." },
            ].map((item, i) => (
              <details key={i} className="rounded-2xl border border-neutral-200 bg-white/70 p-4">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-2 text-sm text-neutral-700">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
// review trigger
