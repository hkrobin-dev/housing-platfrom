"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";

interface PaymentRecord {
  id: string;
  amount: number | string;
  status: string;
  purpose?: string;
  createdAt?: string;
  tranId?: string;
  transactionId?: string | null;
  leaseId?: string | null;
  utilityBillSplitId?: string | null;
}

export default function PaymentsHistoryPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/payments/my")
      .then(({ data }) => setPayments(data.data.payments ?? data.data ?? []))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading payment history..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Payments History</h1>
      <p className="text-sm text-gray-500 mb-6">
        Every SSLCommerz rent & bill payment on your account, newest first.
      </p>
      {payments.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No payments yet"
            message="When you pay rent or a utility bill through SSLCommerz, the receipt will appear here."
            actionLabel="Browse rooms"
            onAction={() => (window.location.href = "/properties")}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">
                  ৳{Number(p.amount).toLocaleString()}
                  {p.purpose ? (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      {p.purpose === "SUBSCRIPTION"
                        ? "Plan subscription"
                        : p.purpose.charAt(0) + p.purpose.slice(1).toLowerCase()}
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-gray-500">
                  {p.tranId || p.transactionId ? `Transaction ${p.tranId || p.transactionId} · ` : ""}
                  {p.leaseId ? "Rent payment · " : ""}
                  {p.utilityBillSplitId ? "Utility bill · " : ""}
                  {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                </p>
              </div>
              <Badge status={p.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
