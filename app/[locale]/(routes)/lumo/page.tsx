import Footer from '@/app/components/ui/footer';
import Image from 'next/image';
import { MagnifyingGlassIcon, FilmIcon, BoltIcon, CalendarDaysIcon, EnvelopeIcon, BanknotesIcon } from "@heroicons/react/24/outline";

export default function LumoLandingPage({ searchParams }: { searchParams: { ok?: string } }) {

  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: '#FDFCF9'}}>
      
      {/* Logo Header */}
      <div className="pt-4 pl-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-[#8D2D26]">Lumo</span>
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
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
              LUMO łączy marki z twórcami, którzy i podróżują do konkretnych miejsc. Zamknięta wersja beta — zapisz się poniżej.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 pt-1">
              <a 
                href="#creator-form" 
                aria-label="Przejdź do formularza Twórcy"
                className="inline-flex items-center rounded-2xl px-6 md:px-7 py-3 bg-[#8D2D26] text-white hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D2D26]"
              >
                Jestem Twórcą
              </a>
              <a 
                href="#brand-form" 
                aria-label="Przejdź do formularza Marki"
                className="inline-flex items-center rounded-2xl px-6 md:px-7 py-3 border border-[#8D2D26]/30 text-[#8D2D26] hover:bg-[#8D2D26]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D2D26]"
              >
                Jestem Marką
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* For Creators Section */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-[#8D2D26] text-left">Dla twórców</h2>
          <div className="mt-2 text-neutral-600">Zarabiaj na podróżach bez nachalnych ofert</div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            <div className="rounded-2xl border border-neutral-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex justify-center">
                <CalendarDaysIcon className="h-8 w-8 md:h-10 md:w-10 text-[#8D2D26]" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base md:text-lg font-semibold tracking-[-0.01em]">Dodaj swoje nadchodzące wyjazdy</h3>
              <p className="mt-1.5 text-sm md:text-[15px] leading-relaxed text-neutral-600 max-w-[30ch]">
                Miasta i daty — marki zobaczą Cię dokładnie wtedy, kiedy trzeba.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex justify-center">
                <EnvelopeIcon className="h-8 w-8 md:h-10 md:w-10 text-[#8D2D26]" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base md:text-lg font-semibold tracking-[-0.01em]">Otrzymuj trafne zapytania</h3>
              <p className="mt-1.5 text-sm md:text-[15px] leading-relaxed text-neutral-600 max-w-[30ch]">
                Bez cold pitchu — tylko konkretne briefy od zainteresowanych marek.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex justify-center">
                <BanknotesIcon className="h-8 w-8 md:h-10 md:w-10 text-[#8D2D26]" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base md:text-lg font-semibold tracking-[-0.01em]">Wypłata po akceptacji treści</h3>
              <p className="mt-1.5 text-sm md:text-[15px] leading-relaxed text-neutral-600 max-w-[30ch]">
                Środki są bezpieczne — trafiają do Ciebie po zatwierdzeniu przez markę.
              </p>
            </div>
          </div>

          <a href="#creator-form" className="inline-flex items-center rounded-2xl border border-[#8D2D26]/30 text-[#8D2D26] hover:bg-[#8D2D26]/5 px-5 py-2 mt-8">
            Dołącz jako Twórca →
          </a>
        </div>
      </section>

      {/* For Brands Section */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-[#8D2D26] text-left">Dla marek</h2>
          <div className="mt-2 text-neutral-600">Zamów treści z miejsca, zanim ktoś tam dotrze</div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            <div className="rounded-2xl border border-neutral-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex justify-center">
                <MagnifyingGlassIcon className="h-8 w-8 md:h-10 md:w-10 text-[#8D2D26]" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base md:text-lg font-semibold tracking-[-0.01em]">Zobacz, kto będzie w Twojej lokalizacji</h3>
              <p className="mt-1.5 text-sm md:text-[15px] leading-relaxed text-neutral-600 max-w-[30ch]">
                Przeglądaj twórców według miasta i dat podróży.
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

          <a href="#brand-form" className="inline-flex items-center rounded-2xl border border-[#8D2D26]/30 text-[#8D2D26] hover:bg-[#8D2D26]/5 px-5 py-2 mt-8">
            Dołącz jako Marka →
          </a>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 md:py-20 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-[#8D2D26]">
            Tak to wygląda w praktyce
          </h2>
          <p className="mt-3 text-base md:text-lg text-neutral-600 text-center mx-auto max-w-2xl">
            Zobacz jakie funkcje są dostępne na platformie
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Screenshot 1 - Profile */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="relative">
                <Image
                  src="/images/demo/profile.png"
                  alt="Profil twórcy z nadchodzącymi wyjazdami"
                  width={400}
                  height={300}
                  className="w-full h-auto"
                  priority={false}
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-neutral-600 text-center">
                  Twórcy dodają swoje nadchodzące wyjazdy — marki widzą, kto będzie w danym miejscu i kiedy.
                </p>
              </div>
            </div>

            {/* Screenshot 2 - Packages Calendar */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="relative">
                <Image
                  src="/images/demo/packages-calendar.png"
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
                  src="/images/demo/message.png"
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

      {/* Creator Form Section */}
      <section id="creator-form" className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em]">Dołącz jako Twórca</h2>
          
          {/* Success Alert */}
          {searchParams.ok === "creator" && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 text-green-800 px-4 py-3">
              Dziękujemy! Zgłoszenie twórcy zapisane. Odezwiemy się z dostępem do bety.
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
                  <input name="trip_city[]" placeholder="Miasto" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input type="date" name="trip_from[]" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input type="date" name="trip_to[]" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <input name="trip_city[]" placeholder="Miasto" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input type="date" name="trip_from[]" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input type="date" name="trip_to[]" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <input name="trip_city[]" placeholder="Miasto" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input type="date" name="trip_from[]" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input type="date" name="trip_to[]" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
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

      {/* Brand Form Section */}
      <section id="brand-form" className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.01em]">Dołącz jako Marka</h2>
          
          {/* Success Alert */}
          {searchParams.ok === "brand" && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 text-green-800 px-4 py-3">
              Dziękujemy! Zgłoszenie marki zapisane. Odezwiemy się z dostępem do bety.
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
                <div className="text-sm font-medium mb-3">Lokalizacje i okna czasowe (maks. 3)</div>
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <input name="req_city[]" placeholder="Miasto" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input type="date" name="req_from[]" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input type="date" name="req_to[]" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <input name="req_city[]" placeholder="Miasto" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input type="date" name="req_from[]" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input type="date" name="req_to[]" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <input name="req_city[]" placeholder="Miasto" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input type="date" name="req_from[]" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input type="date" name="req_to[]" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                </div>

                {/* Job type checkboxes (apply to request in general) */}
                <div className="mt-4">
                  <span className="block text-sm font-medium">Typ zlecenia</span>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["zdjęcia","wideo","reels","stories"].map((t,i)=>(
                      <label key={i} className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" name="jobType" value={t} className="size-4 rounded border-neutral-300 text-[#8D2D26] focus:ring-[#8D2D26]/30" /> {t}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <input name="assetsQty" placeholder="Ilość assetów (np. 10 zdjęć + 2 reels)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input name="budget" placeholder="Budżet (np. 1500–4000 PLN)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
                  <input name="taxId" placeholder="NIP (opcjonalnie)" className="mt-0 w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] placeholder:text-neutral-400" />
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

      {/* Bottom CTA Section */}
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
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 pt-1">
              <a 
                href="#creator-form" 
                aria-label="Przejdź do formularza Twórcy"
                className="inline-flex items-center rounded-2xl px-6 md:px-7 py-3 bg-[#8D2D26] text-white hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D2D26]"
              >
                Jestem Twórcą
              </a>
              <a 
                href="#brand-form" 
                aria-label="Przejdź do formularza Marki"
                className="inline-flex items-center rounded-2xl px-6 md:px-7 py-3 border border-[#8D2D26]/30 text-[#8D2D26] hover:bg-[#8D2D26]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D2D26]"
              >
                Jestem Marką
              </a>
            </div>
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
              { q: "Co to jest Lumo?", a: "LUMO łączy marki z twórcami, którzy podróżują do konkretnych miejsc" },
              { q: "Czy to działa tylko latem?", a: "Nie. Twórcy podróżują cały rok — city breaki, delegacje, narty, festiwale. Zlecenia są realizowane niezależnie od sezonu." },
              { q: "Jak działa płatność i bezpieczeństwo?", a: "Marka opłaca zlecenie z góry, środki zostają zabezpieczone przez naszą platformę. Wypłata dla twórcy następuje po akceptacji materiałów przez markę." },
              { q: "Ile to kosztuje?", a: "Rejestracja jest bezpłatna. Budżet za content ustalacie między sobą według pakietów twórcy." },
              { q: "Czy muszę mieć dużą liczbę obserwujących, by zostać twórcą?", a: "Nie. Liczy się umiejętność tworzenia autentycznych materiałów i dostępność w danej lokalizacji/terminie." },
              { q: "Co, jeśli termin nagle się zmieni?", a: "Przy zmianach dat skontaktujcie się przez chat i ustalcie nowy termin. W razie potrzeby można anulować/zmodyfikować zlecenie zgodnie z ustaleniami." },
              { q: "Jak szybko dostanę materiały?", a: "Standard: 48–72h od nagrania/zdjęć. Ekspres (24h) bywa możliwy — zależy od pakietu i dostępności twórcy." },
              { q: "Czy mogę zobaczyć dostępnych twórców w konkretnej lokalizacji?", a: "Tak. Twórcy publikują nadchodzące wyjazdy (miasto + daty), więc marki widzą, kto będzie na miejscu w danym czasie." },
              { q: "Jak wygląda kontakt z twórcą?", a: "Marka wysyła brief i wiadomość przez operatora p. Szczegóły, terminy i pakiet doprecyzowujecie w czacie." },
              { q: "Czy wystawiacie faktury / jak rozliczamy?", a: "Rozliczenie odbywa się przez operatora płatności Stripe. Faktury/rachunki wystawiane są zgodnie z danymi podanymi w profilu marki." },
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
} // review trigger
