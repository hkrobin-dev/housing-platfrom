"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, getErrorMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        if (user!.role === "ADMIN") {
          const { data } = await api.get("/dashboard/admin");
          setStats(data.data.stats);
        } else if (user!.role === "OWNER" || user!.role === "MANAGER") {
          const { data } = await api.get("/dashboard/owner");
          setStats(data.data.stats);
        } else {
          setStats(null); // Tenants see a simple welcome instead of aggregate stats
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return <Loader />;

  if (!stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}</h1>
        <p className="text-gray-500">
          Use the sidebar to check your applications, leases, rent, bills, and maintenance
          requests.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {user?.role === "ADMIN" ? "Admin Dashboard" : "Owner Dashboard"}
      </h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(stats).map(([key, value]) => {
          if (key === "usersByRole" && Array.isArray(value)) {
            return (
              <div key={key} className="card sm:col-span-2 lg:col-span-3">
                <p className="text-sm text-gray-500 mb-2">Users by role</p>
                <div className="flex gap-4 flex-wrap">
                  {(value as { role: string; count: number }[]).map((r) => (
                    <div key={r.role} className="text-sm">
                      <span className="font-semibold">{r.count}</span>{" "}
                      <span className="text-gray-500">{r.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          if (typeof value === "object") return null;
          return (
            <div key={key} className="card">
              <p className="text-sm text-gray-500 mb-1">{formatLabel(key)}</p>
              <p className="text-2xl font-bold">{String(value)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
