"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getErrorMessage } from "@/lib/api";
import { Lease } from "@/lib/types";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import toast from "react-hot-toast";

export default function MyLeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/leases/my")
      .then(({ data }) => setLeases(data.data.leases))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Leases</h1>
      {leases.length === 0 ? (
        <p className="text-gray-500">No active leases yet.</p>
      ) : (
        <div className="space-y-3">
          {leases.map((l) => (
            <Link key={l.id} href={`/dashboard/leases/${l.id}`} className="card flex items-center justify-between block hover:shadow-md transition">
              <div>
                <p className="font-medium">{l.room?.property?.title}</p>
                <p className="text-xs text-gray-500">
                  Room {l.room?.roomNo} · ৳{Number(l.rentAmount).toLocaleString()}/mo · since{" "}
                  {new Date(l.startDate).toLocaleDateString()}
                </p>
              </div>
              <Badge status={l.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
