"use client";
import { useEffect, useMemo, useState } from "react";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function CountdownEarlyAccess() {
  // 19 Oct 2025 11:00 CET
  const target = useMemo(() => new Date("2025-10-19T11:00:00+02:00"), []);
  const [t, setT] = useState<TimeLeft>(() => getTimeLeft(target));
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const id = setInterval(() => setT(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("err");
      return;
    }
    try {
      setStatus("loading");
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "countdown" }),
      });
      if (res.ok) setStatus("ok");
      else setStatus("err");
    } catch {
      setStatus("err");
    }
  }

  const gridBox =
    "flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white/70 px-5 py-4 shadow-sm";

  // Prevent hydration mismatch by showing placeholder until client-side
  const displayTime = isClient ? t : { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 sm:px-6">
      <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#8D2D26]/5 to-[#8D2D26]/10 p-5 sm:p-8 ring-1 ring-neutral-200">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-[#8D2D26] sm:text-3xl">
          Start platformy już wkrótce
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Odliczamy do <span className="font-medium">19.10.2025, godz. 11:00</span>.
        </p>

        {/* Countdown */}
        <div className="mt-6 grid grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "dni", value: displayTime.days },
            { label: "godziny", value: displayTime.hours },
            { label: "minuty", value: displayTime.minutes },
            { label: "sekundy", value: displayTime.seconds },
          ].map((item) => (
            <div key={item.label} className={gridBox} aria-live="polite">
              <div className="text-3xl font-bold tabular-nums sm:text-4xl text-[#8D2D26]">
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Email capture */}
        <div className="mt-8">
          <p className="text-center text-base font-medium text-neutral-800">
            Chcesz dostać dostęp jako pierwsza?
          </p>
          <p className="mt-1 text-center text-sm text-neutral-600">
            Zostaw e-mail — wyślemy Ci wcześniejszy dostęp.
          </p>

          <form onSubmit={onSubmit} className="mx-auto mt-4 flex w-full max-w-xl gap-3">
            <label htmlFor="early-email" className="sr-only">Adres e-mail</label>
            <input
              id="early-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder="twoj@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base outline-none ring-0 placeholder:text-neutral-400 focus:border-[#8D2D26]/30 focus:ring-2 focus:ring-[#8D2D26]/20"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 rounded-xl bg-[#8D2D26] px-4 py-3 text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {status === "loading" ? "Wysyłanie…" : "Zapisz mnie"}
            </button>
          </form>

          {status === "ok" && (
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-emerald-700">
              Dziękujemy! Sprawdzaj skrzynkę — wyślemy dostęp przed startem.
            </p>
          )}
          {status === "err" && (
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-red-600">
              Coś poszło nie tak. Sprawdź e-mail i spróbuj ponownie.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
