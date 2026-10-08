import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  Users,
  CalendarCheck,
  FileText,
  Wallet,
  Wrench,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services | Housing Platform",
  description:
    "Property listings, roommate matching, viewings, applications, leases, rent and bill payments, and maintenance — everything the platform does.",
  openGraph: {
    title: "Services | Housing Platform",
    description: "One platform from first search to monthly rent.",
  },
};

const SERVICES = [
  {
    icon: Search,
    title: "Verified property listings",
    text: "Owners list properties with rooms, photos, amenities, and availability. Tenants filter by city, type, and budget — all in the URL so views are shareable.",
  },
  {
    icon: Users,
    title: "Roommate matching",
    text: "Build a profile with budget, location, and lifestyle tags, then get scored matches for roommates and compatible rooms.",
  },
  {
    icon: CalendarCheck,
    title: "Viewing requests",
    text: "Tenants request a viewing slot; owners and managers approve or reject. Approved viewings keep everyone on the same schedule.",
  },
  {
    icon: FileText,
    title: "Online applications & leases",
    text: "Apply to a room in clicks. Approval reserves the seat atomically and creates the lease — no double-booking, no paperwork chase.",
  },
  {
    icon: Wallet,
    title: "Rent, bills & secure payments",
    text: "Automatic rent schedules and split utility bills, payable through SSLCommerz with success / fail / cancel redirects and receipts.",
  },
  {
    icon: Wrench,
    title: "Maintenance & documents",
    text: "Raise prioritized maintenance requests, track resolution, and store NID and lease documents securely via Cloudinary uploads.",
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">
        Services
      </p>
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Everything renting needs</h1>
      <p className="text-gray-600 max-w-2xl mb-10">
        One platform from first search to monthly rent — for tenants, owners, managers, and admins.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {SERVICES.map((s) => (
          <div key={s.title} className="card">
            <s.icon className="text-brand-600 mb-3" size={24} />
            <h2 className="font-semibold mb-1.5">{s.title}</h2>
            <p className="text-sm text-gray-600">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/pricing" className="btn-primary inline-flex items-center gap-1.5">
          See pricing <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
