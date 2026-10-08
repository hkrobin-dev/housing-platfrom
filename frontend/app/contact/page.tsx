import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | Housing Platform",
  description:
    "Contact the Housing Platform team — support for tenants, owners, and managers.",
  openGraph: {
    title: "Contact | Housing Platform",
    description: "We reply within one business day.",
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2">
        Contact
      </p>
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Talk to a human</h1>
      <p className="text-gray-600 max-w-xl mb-10">
        Questions about a listing, a payment, or your account? Send us a message — we reply within
        one business day.
      </p>

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        <div className="card">
          <ContactForm />
        </div>
        <div className="space-y-4">
          <div className="card flex gap-3">
            <Mail size={18} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Email</p>
              <p className="text-sm text-gray-600">support@housing-platform.com</p>
            </div>
          </div>
          <div className="card flex gap-3">
            <Phone size={18} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Phone</p>
              <p className="text-sm text-gray-600">+880 1700-000000 (Sat–Thu, 10am–6pm)</p>
            </div>
          </div>
          <div className="card flex gap-3">
            <MapPin size={18} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Office</p>
              <p className="text-sm text-gray-600">Gulshan Avenue, Dhaka 1212, Bangladesh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
