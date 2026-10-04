"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  ShieldCheck,
  Wallet,
  Sparkles,
  CalendarCheck,
  KeyRound,
  ArrowRight,
  Star,
} from "lucide-react";

const STATS = [
  { value: "500+", label: "Verified rooms" },
  { value: "1.2k", label: "Happy tenants" },
  { value: "98%", label: "Match success" },
];

const FEATURES = [
  {
    icon: Search,
    title: "Browse & Apply",
    text: "Search rooms by city and budget, request a viewing, and apply in a few clicks.",
  },
  {
    icon: Users,
    title: "Roommate Matching",
    text: "A scored match on budget, location, and lifestyle — find people you'll actually get along with.",
  },
  {
    icon: Wallet,
    title: "Rent & Bills",
    text: "Automatic rent schedules, split utility bills, and secure online payment.",
  },
];

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Discover",
    text: "Search verified rooms or get matched with compatible roommates.",
  },
  {
    icon: CalendarCheck,
    step: "02",
    title: "Visit & Apply",
    text: "Request a viewing, then apply online — approval creates your lease automatically.",
  },
  {
    icon: KeyRound,
    step: "03",
    title: "Move in",
    text: "Pay rent, split bills, and raise maintenance requests from your dashboard.",
  },
];

export default function HomePage() {
  const [city, setCity] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/properties${city ? `?city=${encodeURIComponent(city)}` : ""}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-100/60 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-emerald-100/50 blur-3xl"
        />

        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-14 sm:pt-24 sm:pb-20 text-center">
          <div className="animate-fade-in inline-flex items-center gap-1.5 bg-white border border-brand-100 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm mb-5">
            <Sparkles size={14} /> AI-powered room & roommate matching
          </div>

          <h1
            className="animate-fade-in-up text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 mb-4"
            style={{ animationDelay: "80ms" }}
          >
            Find your room.
            <br />
            <span className="text-gradient">Find your roommate.</span>
          </h1>

          <p
            className="animate-fade-in-up text-gray-600 text-base sm:text-lg mb-8 max-w-xl mx-auto"
            style={{ animationDelay: "160ms" }}
          >
            Browse verified listings, match with compatible roommates, and manage your entire
            tenancy — rent, bills, and maintenance — in one place.
          </p>

          <form
            onSubmit={handleSearch}
            className="animate-fade-in-up max-w-lg mx-auto flex gap-2 bg-white p-2 rounded-2xl shadow-xl shadow-brand-500/10 border border-gray-100"
            style={{ animationDelay: "240ms" }}
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm focus:outline-none placeholder:text-gray-400"
                placeholder="Search by city, e.g. Dhaka"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <button className="btn-primary whitespace-nowrap shadow-md">Search</button>
          </form>

          <div
            className="animate-fade-in-up mt-5 flex items-center justify-center gap-4 text-sm"
            style={{ animationDelay: "320ms" }}
          >
            <Link
              href="/roommates"
              className="text-brand-600 font-medium hover:underline inline-flex items-center gap-1"
            >
              Or find a roommate match <ArrowRight size={15} />
            </Link>
          </div>

          {/* Stats */}
          <div
            className="animate-fade-in-up mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto"
            style={{ animationDelay: "400ms" }}
          >
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/70 backdrop-blur rounded-2xl border border-gray-100 py-4 shadow-sm">
                <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Everything renting needs</h2>
          <p className="text-gray-500 text-sm sm:text-base">
            One platform from first search to monthly rent.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="card text-center animate-fade-in-up group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                <f.icon className="text-white" size={22} />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-gray-50 to-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">How it works</h2>
            <p className="text-gray-500 text-sm sm:text-base">From search to sofa in three steps.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="absolute top-4 right-5 text-4xl font-extrabold text-brand-50 select-none">
                  {s.step}
                </span>
                <s.icon className="text-brand-500 mb-3" size={26} />
                <h3 className="font-semibold mb-1.5">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="card flex flex-col sm:flex-row items-center gap-4 !p-6 bg-gradient-to-r from-brand-50/60 to-white">
          <div className="flex -space-x-2">
            {["AR", "TN", "SK"].map((initials, i) => (
              <span
                key={initials}
                className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white ${
                  ["bg-brand-500", "bg-emerald-500", "bg-teal-600"][i]
                }`}
              >
                {initials}
              </span>
            ))}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              “Found my room and roommate in one weekend. The application-to-lease flow just
              worked.” — tenants across Dhaka & Chattogram
            </p>
          </div>
        </div>
      </section>

      {/* Owner CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-500 px-6 py-12 sm:py-16 text-center text-white shadow-xl">
          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl"
          />
          <ShieldCheck className="mx-auto mb-4 opacity-90" size={32} />
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Are you a property owner?</h2>
          <p className="text-brand-50 text-sm sm:text-base mb-6 max-w-md mx-auto">
            List your property, manage rooms and availability, and review applications — all from
            one dashboard.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            List your property <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
