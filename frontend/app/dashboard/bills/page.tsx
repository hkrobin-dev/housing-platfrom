"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { UtilityBillSplit } from "@/lib/types";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import toast from "react-hot-toast";

export default function MyBillsPage() {
  const [splits, setSplits] = useState<UtilityBillSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/utility-bills/my-splits");
      setSplits(data.data.splits);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function pay(id: string) {
    setPayingId(id);
    try {
      const { data } = await api.post(`/utility-bills/splits/${id}/pay`);
      window.location.href = data.data.gatewayUrl;
    } catch (err) {
      toast.error(getErrorMessage(err));
      setPayingId(null);
    }
  }

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Utility Bills</h1>
      {splits.length === 0 ? (
        <p className="text-gray-500">No utility bills assigned to you yet.</p>
      ) : (
        <div className="space-y-3">
          {splits.map((s) => (
            <div key={s.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {s.utilityBill?.billType} — {s.utilityBill?.month}
                </p>
                <p className="text-xs text-gray-500">{s.utilityBill?.property?.title}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Your share: ৳{Number(s.shareAmount).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={s.status} />
                {s.status !== "PAID" && (
                  <button
                    onClick={() => pay(s.id)}
                    disabled={payingId === s.id}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    {payingId === s.id ? "Redirecting..." : "Pay Now"}
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
