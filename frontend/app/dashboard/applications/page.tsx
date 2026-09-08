"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getErrorMessage } from "@/lib/api";
import { Application } from "@/lib/types";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import toast from "react-hot-toast";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/applications/my")
      .then(({ data }) => setApplications(data.data.applications))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>
      {applications.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t applied to any rooms yet.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((a) => (
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
