"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, ShieldCheck, Wallet } from "lucide-react";

export default function HomePage() {
  const [city, setCity] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/properties${city ? `?city=${encodeURIComponent(city)}` : ""}`);
  }

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Find your room. Find your roommate.
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
            Browse verified listings, match with compatible roommates, and manage your entire
            tenancy — rent, bills, and maintenance — in one place.
          </p>

          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
            <input
              className="input"
              placeholder="Search by city, e.g. Dhaka"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button className="btn-primary flex items-center gap-2 whitespace-nowrap">
              <Search size={16} /> Search
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <Link href="/roommates" className="text-brand-600 hover:underline">
              Or find a roommate match →
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16 grid sm:grid-cols-3 gap-6">
        <div className="card text-center">
          <Search className="mx-auto text-brand-500 mb-3" size={28} />
          <h3 className="font-semibold mb-1">Browse & Apply</h3>
          <p className="text-sm text-gray-600">
            Search rooms by city and budget, request a viewing, and apply in a few clicks.
          </p>
        </div>
        <div className="card text-center">
          <Users className="mx-auto text-brand-500 mb-3" size={28} />
          <h3 className="font-semibold mb-1">Roommate Matching</h3>
          <p className="text-sm text-gray-600">
            A scored match on budget, location, and lifestyle — find people you&apos;ll actually get
            along with.
          </p>
        </div>
        <div className="card text-center">
          <Wallet className="mx-auto text-brand-500 mb-3" size={28} />
          <h3 className="font-semibold mb-1">Rent & Bills</h3>
          <p className="text-sm text-gray-600">
            Automatic rent schedules, split utility bills, and secure online payment.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <ShieldCheck className="mx-auto text-brand-500 mb-3" size={28} />
          <h3 className="font-semibold mb-2">Are you a property owner?</h3>
          <p className="text-sm text-gray-600 mb-4">
            List your property, manage rooms and availability, and review applications — all from
            one dashboard.
          </p>
          <Link href="/register" className="btn-primary">
            List your property
          </Link>
        </div>
      </section>
    </div>
  );
}
