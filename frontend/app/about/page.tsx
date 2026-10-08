import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Users, Wallet, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Housing Platform",
  description:
    "Learn how the Housing Platform connects tenants, owners, and managers — verified listings, roommate matching, rent and maintenance in one place.",
  openGraph: {
    title: "About | Housing Platform",
    description: "Verified rooms, compatible roommates, and stress-free tenancy management.",
  },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Verified listings only",
    text: "Every property is reviewed before it goes live, so tenants browse rooms they can trust — no fake photos, no ghost listings.",
  },
  {
    icon: Users,
    title: "People-first matching",
    text: "Our roommate matcher scores budget, location, and lifestyle compatibility to pair people who will actually enjoy living together.",
  },
  {
    icon: Wallet,
    title: "Transparent money flows",
    text: "Automatic rent schedules, split utility bills, and secure SSLCommerz payments with receipts — owners and tenants always see the same numbers.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">About us</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
        Renting, minus the chaos.
      </h1>
      <p className="text-gray-600 max-w-2xl mb-10">
        The Housing Platform brings tenants, property owners, and managers into one workspace:
        search verified rooms, request viewings, apply online, sign a lease, then pay rent, split
        bills, and raise maintenance requests — without juggling spreadsheets and chat threads.
      </p>

      <div className="grid sm:grid-cols-3 gap-5 mb-12">
        {VALUES.map((v) => (
          <div key={v.title} className="card">
            <v.icon className="text-brand-600 mb-3" size={24} />
            <h2 className="font-semibold mb-1.5">{v.title}</h2>
            <p className="text-sm text-gray-600">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="card !p-8 text-center bg-gradient-to-r from-brand-50/70 to-white">
        <h2 className="text-xl font-bold mb-2">Ready to find your place?</h2>
        <p className="text-sm text-gray-600 mb-5">
          Browse verified rooms or get matched with a compatible roommate today.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/properties" className="btn-primary inline-flex items-center gap-1.5">
            Browse rooms <ArrowRight size={15} />
          </Link>
          <Link href="/roommates" className="btn-secondary">
            Find a roommate
          </Link>
        </div>
      </div>
    </div>
  );
}
