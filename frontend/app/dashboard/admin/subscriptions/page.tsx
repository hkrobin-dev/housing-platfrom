"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";
import { BadgeCheck } from "lucide-react";
import clsx from "clsx";

interface PlanRequest {
  id: string;
  plan: "OWNER" | "MANAGER";
  amount: number | string;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  user: { id: string; name: string; email: string; role: string };
  payment?: {
    id: string;
    status: string;
    amount: number | string;
    transactionId?: string | null;
  } | null;
}

const FILTERS = ["", "PENDING", "ACTIVE", "EXPIRED", "CANCELLED"];

export default function AdminSubscriptionsPage() {
  return (
    <ProtectedRoute allow={["ADMIN"]}>
      <RequestsContent />
    </ProtectedRoute>
  );
}

function RequestsContent() {
  const [requests, setRequests] = useState<PlanRequest[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function load(status: string) {
    setLoading(true);
    try {
      const { data } = await api.get("/subscriptions", {
        params: status ? { status } : {},
      });
      setRequests(data.data.subscriptions ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function approve(req: PlanRequest, verb = "approved") {
    setApprovingId(req.id);
    try {
      await api.patch(`/subscriptions/${req.id}/approve`);
      toast.success(`${req.user.email} ${verb} — ${req.plan} role granted`);
      load(filter);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setApprovingId(null);
    }
  }

  if (loading) return <Loader label="Loading plan requests..." />;

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Plan Requests</h1>
      <p className="text-sm text-gray-500 mb-4">
        Everyone who bought a plan on pricing — payment status included. Successful
        payments auto-activate the plan and grant the role; approve manually only when a
        payment was verified late.
      </p>

      {pendingCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <BadgeCheck size={17} />
          <span>
            <strong>{pendingCount}</strong> pending request{pendingCount > 1 ? "s" : ""}{" "}
            waiting for payment verification or manual approval.
          </span>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map((f) => (
          <button
            key={f || "all"}
            onClick={() => setFilter(f)}
            className={clsx(
              "text-xs font-medium px-3 py-1.5 rounded-full border transition",
              filter === f
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white text-gray-600 border-gray-300 hover:border-brand-300"
            )}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No plan requests"
            message="When someone pays for an Owner or Manager plan, their request appears here."
          />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2">User</th>
                <th className="pb-2">Plan paid for</th>
                <th className="pb-2">Payment</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2">
                    <p className="font-medium">{r.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {r.user.email} · current role: {r.user.role}
                    </p>
                  </td>
                  <td className="py-2">
                    <Badge status={r.plan} />
                    <p className="text-xs text-gray-500 mt-1">
                      ৳{Number(r.amount).toLocaleString()}
                      {r.endDate
                        ? ` · until ${new Date(r.endDate).toLocaleDateString()}`
                        : ""}
                    </p>
                  </td>
                  <td className="py-2">
                    {r.payment ? (
                      <>
                        <Badge status={r.payment.status} />
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {r.payment.transactionId ?? "—"}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">No payment yet</span>
                    )}
                  </td>
                  <td className="py-2">
                    <Badge status={r.status} />
                  </td>
                  <td className="py-2">
                    {r.status === "PENDING" && (
                      <button
                        onClick={() => approve(r, "approved")}
                        disabled={approvingId === r.id}
                        className="btn-primary text-xs px-2 py-1 disabled:opacity-60"
                      >
                        {approvingId === r.id ? "Approving..." : "Approve"}
                      </button>
                    )}
                    {r.status === "ACTIVE" &&
                      r.user.role !== r.plan &&
                      r.user.role !== "ADMIN" && (
                        <button
                          onClick={() => approve(r, "role synced")}
                          disabled={approvingId === r.id}
                          className="btn-secondary text-xs px-2 py-1 disabled:opacity-60"
                        >
                          {approvingId === r.id ? "Syncing..." : "Grant role"}
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
