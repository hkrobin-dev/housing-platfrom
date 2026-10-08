"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import Loader from "@/components/Loader";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface SubscriptionInfo {
  id: string;
  plan: "OWNER" | "MANAGER";
  amount: number | string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
}

interface PaymentInfo {
  id: string;
  purpose: "RENT" | "DEPOSIT" | "UTILITY" | "SUBSCRIPTION";
  amount: number | string;
  status: "INITIATED" | "SUCCESS" | "FAILED" | "CANCELLED";
  transactionId?: string | null;
  gatewayRefId?: string | null;
  createdAt?: string;
  subscription?: SubscriptionInfo | null;
}

const PLAN_COPY: Record<string, { label: string; role: string; perks: string[] }> = {
  OWNER: {
    label: "Owner plan",
    role: "OWNER",
    perks: [
      "Up to 5 properties & 50 rooms",
      "Application review & auto-lease",
      "Rent schedules & bill splitting",
    ],
  },
  MANAGER: {
    label: "Manager plan",
    role: "MANAGER",
    perks: [
      "Property-scoped management access",
      "Viewing & application handling",
      "Bill & maintenance operations",
    ],
  },
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<Loader label="Confirming payment..." />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tran_id") || searchParams.get("tranId");
  const { user, refreshUser } = useAuth();
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [activePlan, setActivePlan] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(!!tranId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tranId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Primary: exact payment + linked subscription in one call.
        try {
          const { data } = await api.get(`/payments/by-tran/${tranId}`);
          if (!cancelled) setPayment(data.data.payment);
        } catch (err) {
          // Fallback for backends without the new endpoint: find it in history.
          const { data } = await api.get("/payments/my");
          const list: PaymentInfo[] = data.data.payments ?? data.data ?? [];
          const found =
            list.find((p) => p.transactionId === tranId) ??
            (list.find((p) => (p as { tranId?: string }).tranId === tranId) as
              | PaymentInfo
              | undefined);
          if (!found) throw err;
          if (!cancelled) setPayment(found);
        }
        // Active plan (what the pricing purchase unlocked) + fresh user/role.
        api
          .get("/subscriptions/my")
          .then(({ data }) => {
            if (!cancelled) setActivePlan(data.data.active ?? null);
          })
          .catch(() => null);
        refreshUser().catch(() => null);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tranId]);

  if (!tranId) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
        <h1 className="text-xl font-bold mb-2">No transaction found</h1>
        <p className="text-gray-500 mb-6">
          This page needs a transaction ID (e.g.{" "}
          <span className="font-mono">?tran_id=TXN-…</span>). If you just paid on the
          pricing page, wait for SSLCommerz to redirect you back here automatically.
        </p>
        <div className="flex gap-2 justify-center">
          <Link href="/pricing" className="btn-primary">
            Back to pricing
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Loader2 className="mx-auto animate-spin text-brand-600 mb-4" size={40} />
        <h1 className="text-xl font-bold mb-2">Confirming your payment…</h1>
        <p className="text-sm text-gray-500">
          Verifying <span className="font-mono">{tranId}</span> with the server. Your plan
          activates only after server-side validation.
        </p>
      </div>
    );
  }

  if (error || !payment) {
    const needsLogin = /401|unauthor|log in/i.test(error ?? "");
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <XCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-xl font-bold mb-2">Could not verify payment</h1>
        <p className="text-gray-500 mb-2">{error ?? "Payment record not found."}</p>
        <p className="text-xs text-gray-400 mb-6 font-mono">{tranId}</p>
        <div className="flex gap-2 justify-center">
          {needsLogin ? (
            <Link
              href={`/login?next=/payments/success?tran_id=${encodeURIComponent(tranId)}`}
              className="btn-primary"
            >
              Log in to view receipt
            </Link>
          ) : (
            <Link href="/dashboard/payments" className="btn-primary">
              View payment history
            </Link>
          )}
          <Link href="/pricing" className="btn-secondary">
            Pricing
          </Link>
        </div>
      </div>
    );
  }

  const isSubscription = payment.purpose === "SUBSCRIPTION";
  const sub = payment.subscription ?? activePlan ?? null;
  const planCopy = sub ? PLAN_COPY[sub.plan] : null;
  const verified = payment.status === "SUCCESS";
  const pending = payment.status === "INITIATED";

  return (
    <div className="max-w-lg mx-auto px-4 py-14">
      <div className="text-center mb-6">
        {verified ? (
          <CheckCircle2 className="mx-auto text-green-500 mb-3" size={52} />
        ) : pending ? (
          <Clock className="mx-auto text-yellow-500 mb-3" size={52} />
        ) : (
          <XCircle className="mx-auto text-red-500 mb-3" size={52} />
        )}
        <h1 className="text-2xl font-extrabold">
          {verified
            ? "Payment successful"
            : pending
              ? "Payment is being verified"
              : "Payment not completed"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {verified
            ? "Confirmed and validated server-side. A receipt was emailed to you."
            : pending
              ? "SSLCommerz redirected back before the server validation finished. Your plan activates automatically once IPN arrives — refresh in a few seconds."
              : "The gateway could not verify this payment. Nothing was activated — please try again from pricing."}
        </p>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {isSubscription ? "Plan purchased" : "Payment for"}
          </span>
          {sub && planCopy ? (
            <span className="badge bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
              <BadgeCheck size={13} /> {planCopy.label} · {sub.plan}
            </span>
          ) : (
            <span className="badge bg-gray-100 text-gray-700">
              {payment.purpose.charAt(0) + payment.purpose.slice(1).toLowerCase()}
            </span>
          )}
        </div>

        <div className="flex items-baseline justify-between border-t pt-3">
          <span className="text-sm text-gray-500">Amount paid</span>
          <span className="text-2xl font-extrabold">
            ৳{Number(payment.amount).toLocaleString()}
          </span>
        </div>

        <dl className="text-sm space-y-1.5 border-t pt-3">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Transaction ID</dt>
            <dd className="font-mono text-xs break-all text-right">
              {payment.transactionId ?? tranId}
            </dd>
          </div>
          {payment.gatewayRefId && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Bank transaction</dt>
              <dd className="font-mono text-xs text-right">{payment.gatewayRefId}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Status</dt>
            <dd className="font-medium">{payment.status}</dd>
          </div>
          {sub?.startDate && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Plan active</dt>
              <dd className="text-right">
                {new Date(sub.startDate).toLocaleDateString()}
                {sub.endDate ? ` → ${new Date(sub.endDate).toLocaleDateString()}` : ""}
              </dd>
            </div>
          )}
          {user && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Account role</dt>
              <dd className="font-medium">{user.role}</dd>
            </div>
          )}
        </dl>

        {sub && planCopy && verified && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-900">
            <p className="font-semibold mb-1">
              You bought the {planCopy.label} ({planCopy.role}) — active for 30 days.
            </p>
            <ul className="list-disc pl-5 space-y-0.5 text-emerald-800">
              {planCopy.perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-6">
        {verified ? (
          <>
            <Link href="/dashboard" className="btn-primary">
              Go to dashboard
            </Link>
            <Link href="/dashboard/payments" className="btn-secondary">
              View payment history
            </Link>
          </>
        ) : pending ? (
          <>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Refresh status
            </button>
            <Link href="/dashboard/payments" className="btn-secondary">
              Payment history
            </Link>
          </>
        ) : (
          <>
            <Link href="/pricing" className="btn-primary">
              Try again on pricing
            </Link>
            <Link href="/dashboard/payments" className="btn-secondary">
              Payment history
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
