"use client";
import { useState } from "react";

export default function CountdownEarlyAccess() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

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

  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 sm:px-6">
      <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#8D2D26]/5 to-[#8D2D26]/10 p-8 sm:p-10 ring-1 ring-neutral-200">
        {/* Heading */}
        <h2 className="text-center text-2xl font-semibold tracking-tight text-[#8D2D26] sm:text-3xl">
          Platforma wystartuje wkrótce 🚀
        </h2>
        
        {/* Subheading */}
        <p className="mt-3 text-center text-base text-neutral-600 sm:text-lg">
          Zostaw e-mail, aby uzyskać wcześniejszy dostęp zaraz po starcie ✨
        </p>

        {/* Email sign-up form */}
        <form onSubmit={onSubmit} className="mx-auto mt-6 flex w-full max-w-xl gap-3 flex-col sm:flex-row">
          <label htmlFor="early-email" className="sr-only">Email address</label>
            <input
              id="early-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
            placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base outline-none ring-0 placeholder:text-neutral-400 focus:border-[#8D2D26]/30 focus:ring-2 focus:ring-[#8D2D26]/20"
            />
            <button
              type="submit"
              disabled={status === "loading"}
            className="shrink-0 rounded-xl bg-[#8D2D26] px-6 py-3 text-white font-medium transition hover:opacity-95 disabled:opacity-60 hover:bg-[#7E241B]"
            >
              {status === "loading" ? "Wysyłanie…" : "Zapisz mnie"}
            </button>
          </form>

          {status === "ok" && (
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-emerald-700">
              Dziękujemy! Sprawdzaj skrzynkę — wyślemy dostęp przed startem.
            </p>
          )}
          {status === "err" && (
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-red-600">
              Coś poszło nie tak. Sprawdź e-mail i spróbuj ponownie.
            </p>
          )}
      </div>
    </section>
  );
}
