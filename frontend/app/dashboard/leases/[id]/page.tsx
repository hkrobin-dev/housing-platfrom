"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import { Lease, RentPayment } from "@/lib/types";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import toast from "react-hot-toast";

export default function LeaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lease, setLease] = useState<Lease | null>(null);
  const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [leaseRes, rentRes] = await Promise.all([
        api.get(`/leases/${id}`),
        api.get(`/rent-payments/lease/${id}`).catch(() => ({ data: { data: { rentPayments: [] } } })),
      ]);
      setLease(leaseRes.data.data.lease);
      setRentPayments(rentRes.data.data.rentPayments);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function payRent(rentPaymentId: string) {
    setPayingId(rentPaymentId);
    try {
      const { data } = await api.post(`/rent-payments/${rentPaymentId}/pay`);
      window.location.href = data.data.gatewayUrl;
    } catch (err) {
      toast.error(getErrorMessage(err));
      setPayingId(null);
    }
  }

  if (loading) return <Loader />;
  if (!lease) return <p className="text-gray-500">Lease not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{lease.room?.property?.title}</h1>
      <p className="text-gray-500 mb-6">
        Room {lease.room?.roomNo} · ৳{Number(lease.rentAmount).toLocaleString()}/month
      </p>

      <div className="card mb-6">
        <div className="flex justify-between items-center">
          <p className="font-medium">Lease status</p>
          <Badge status={lease.status} />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Started {new Date(lease.startDate).toLocaleDateString()}
          {lease.endDate && ` · Ended ${new Date(lease.endDate).toLocaleDateString()}`}
        </p>
      </div>

      <h2 className="font-semibold mb-3">Rent Payments</h2>
      {rentPayments.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No rent schedule yet — ask your property owner to generate one.
        </p>
      ) : (
        <div className="space-y-2">
          {rentPayments.map((r) => (
            <div key={r.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{r.month}</p>
                <p className="text-xs text-gray-500">
                  ৳{Number(r.amount).toLocaleString()} · due {new Date(r.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={r.status} />
                {r.status !== "PAID" && (
                  <button
                    onClick={() => payRent(r.id)}
                    disabled={payingId === r.id}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    {payingId === r.id ? "Redirecting..." : "Pay Now"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
