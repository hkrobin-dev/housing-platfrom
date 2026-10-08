"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, BadgeCheck, Loader2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";
import clsx from "clsx";

type PlanKey = "OWNER" | "MANAGER";

interface Subscription {
  id: string;
  plan: PlanKey;
  amount: number | string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
}

const PLANS: {
  key: PlanKey | "TENANT";
  name: string;
  price: string;
  period: string;
  cta: string;
  featured: boolean;
  features: string[];
}[] = [
  {
    key: "TENANT",
    name: "Tenant",
    price: "Free",
    period: "forever",
    cta: "Start browsing",
    featured: false,
    features: [
      "Unlimited room browsing & filters",
      "Roommate matching scores",
      "Viewing requests & applications",
      "Rent, bills & SSLCommerz payments",
      "Maintenance requests & documents",
    ],
  },
  {
    key: "OWNER",
    name: "Owner",
    price: "৳499",
    period: "/month",
    cta: "Subscribe with SSLCommerz",
    featured: true,
    features: [
      "Up to 5 properties & 50 rooms",
      "Availability & seat management",
      "Application review & auto-lease",
      "Rent schedules & bill splitting",
      "Maintenance tracking",
    ],
  },
  {
    key: "MANAGER",
    name: "Manager",
    price: "৳299",
    period: "/month",
    cta: "Subscribe with SSLCommerz",
    featured: false,
    features: [
      "Property-scoped management access",
      "Assigned by property owner",
      "Viewing & application handling",
      "Bill & maintenance operations",
      "Tenant communication",
    ],
  },
];

const FAQS = [
  {
    q: "Do tenants really pay nothing?",
    a: "Yes. Browsing, matching, applications, rent and bill payments are free for tenants. Only payment-gateway charges from SSLCommerz may apply per transaction.",
  },
  {
    q: "How do plan payments work?",
    a: "Clicking Subscribe creates a pending subscription and redirects you to SSLCommerz (cards, mobile banking, net banking). SSLCommerz notifies our server directly (IPN), the payment is re-validated server-side, and your plan activates for 30 days. Cancel/fail returns you here with nothing charged.",
  },
  {
    q: "Can an owner assign a manager?",
    a: "Yes. Owners assign a manager by email from the property page. The assignee is auto-promoted and scoped to that property only.",
  },
];

export default function PricingClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState<Subscription | null>(null);
  const [checking, setChecking] = useState(false);
  const [buying, setBuying] = useState<PlanKey | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    api
      .get("/subscriptions/my")
      .then(({ data }) => setActive(data.data.active))
      .catch(() => null)
      .finally(() => setChecking(false));
  }, [authLoading, user]);

  async function subscribe(plan: PlanKey) {
    if (!user) {
      router.push("/login?next=/pricing");
      return;
    }
    setBuying(plan);
    try {
      const { data } = await api.post("/subscriptions/checkout", { plan });
      // Real SSLCommerz hosted checkout — the browser leaves our site here and
      // returns via /payments/success|fail|cancel after gateway + IPN validation.
      window.location.href = data.data.gatewayUrl;
    } catch (err) {
      toast.error(getErrorMessage(err));
      setBuying(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-2 text-center">
        Pricing
      </p>
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 text-center">
        Free for tenants. Fair for owners.
      </h1>
      <p className="text-gray-600 text-center max-w-xl mx-auto mb-6">
        Start free, upgrade when your portfolio grows. Plan payments are processed securely via
        SSLCommerz — we never see your card details.
      </p>

      {user && active && (
        <div className="max-w-xl mx-auto mb-8 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <BadgeCheck size={17} />
          <span>
            Your <strong>{active.plan === "OWNER" ? "Owner" : "Manager"}</strong> plan is active
            {active.endDate ? ` until ${new Date(active.endDate).toLocaleDateString()}` : ""}.
          </span>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-5 mb-14">
        {PLANS.map((p) => {
          const isCurrent = !!user && !!active && active.plan === p.key;
          const busy = buying !== null;
          return (
            <div
              key={p.name}
              className={clsx(
                "card flex flex-col",
                p.featured && "border-brand-500 border-2 shadow-lg"
              )}
            >
              {p.featured && (
                <span className="badge bg-brand-500 text-white self-start mb-2">Most popular</span>
              )}
              {isCurrent && (
                <span className="badge bg-emerald-100 text-emerald-700 self-start mb-2">
                  Current plan
                </span>
              )}
              <h2 className="font-semibold">{p.name}</h2>
              <p className="mt-1 mb-4">
                <span className="text-3xl font-extrabold">{p.price}</span>
                <span className="text-sm text-gray-500"> {p.period}</span>
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check size={15} className="text-emerald-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              {p.key === "TENANT" ? (
                <Link href="/properties" className="btn-secondary text-center">
                  {p.cta}
                </Link>
              ) : (
                <button
                  onClick={() => subscribe(p.key as PlanKey)}
                  disabled={busy || isCurrent || (checking && !!user)}
                  className={clsx(
                    p.featured ? "btn-primary" : "btn-secondary",
                    "inline-flex items-center justify-center gap-2 disabled:opacity-60"
                  )}
                >
                  {buying === p.key ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Redirecting to SSLCommerz...
                    </>
                  ) : isCurrent ? (
                    "Active on your account"
                  ) : (
                    p.cta
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 mb-10">
        {user
          ? "Receipts appear under Dashboard → Payments History after every successful payment."
          : "You'll be asked to log in before checkout — demo accounts work too."}
      </p>

      <h2 className="text-xl font-bold mb-4 text-center">Frequently asked questions</h2>
      <div className="max-w-2xl mx-auto space-y-3 mb-10">
        {FAQS.map((f) => (
          <details key={f.q} className="card !py-4">
            <summary className="font-medium cursor-pointer">{f.q}</summary>
            <p className="text-sm text-gray-600 mt-2">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 text-brand-600 font-medium hover:underline"
        >
          Still have questions? Contact us <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
