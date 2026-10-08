"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import { Application } from "@/lib/types";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";

const STATUSES = ["", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"] as const;

export default function MyApplicationsPage() {
  return (
    <Suspense fallback={<Loader label="Loading applications..." />}>
      <ApplicationsContent />
    </Suspense>
  );
}

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status") || "";

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/applications/my")
      .then(({ data }) => setApplications(data.data.applications))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = status ? applications.filter((a) => a.status === status) : applications;

  function setStatus(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("status", next);
    else params.delete("status");
    const qs = params.toString();
    router.push(`/dashboard/applications${qs ? `?${qs}` : ""}`);
  }

  if (loading) return <Loader label="Loading applications..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">My Applications</h1>
      <p className="text-sm text-gray-500 mb-4">Filter by status — the URL updates so views are shareable.</p>

      <div className="flex gap-2 flex-wrap mb-6" role="tablist" aria-label="Filter by status">
        {STATUSES.map((s) => (
          <button
            key={s || "all"}
            role="tab"
            aria-selected={(status || "") === s}
            onClick={() => setStatus(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
              (status || "") === s
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white text-gray-600 border-gray-300 hover:border-brand-300"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title={applications.length === 0 ? "No applications yet" : "No applications with this status"}
            message={
              applications.length === 0
                ? "Browse verified rooms and apply in a few clicks."
                : "Try a different status filter."
            }
            actionLabel={applications.length === 0 ? "Browse rooms" : "Clear filter"}
            onAction={() => {
              if (applications.length === 0) router.push("/properties");
              else setStatus("");
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">Room {a.room?.roomNo}</p>
                <p className="text-xs text-gray-500">
                  {a.room?.property?.title} · applied {new Date(a.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={a.status} />
                {a.lease && (
                  <Link href={`/dashboard/leases/${a.lease.id}`} className="text-brand-600 text-sm hover:underline">
                    View lease →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
