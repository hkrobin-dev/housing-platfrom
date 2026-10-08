"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api, getErrorMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];

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
          setStats(null); // Tenants see quick links instead of aggregate stats
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
        <p className="text-gray-500 mb-6">
          Use the sidebar to check your applications, leases, rent, bills, and maintenance
          requests.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { href: "/properties", title: "Browse rooms", text: "Search verified rooms by city." },
            { href: "/dashboard/applications", title: "My applications", text: "Track application status." },
            { href: "/dashboard/payments", title: "Payments", text: "See every receipt in one place." },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="card hover:shadow-md transition block">
              <p className="font-semibold mb-1">{c.title}</p>
              <p className="text-sm text-gray-500">{c.text}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const numericEntries = Object.entries(stats).filter(([, v]) => typeof v !== "object");
  const barData = numericEntries.map(([key, value]) => ({
    name: formatLabel(key),
    value: Number(value) || 0,
  }));
  const roleBreakdown =
    user?.role === "ADMIN" && Array.isArray(stats.usersByRole)
      ? (stats.usersByRole as { role: string; count: number }[])
      : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {user?.role === "ADMIN" ? "Admin Dashboard" : "Owner Dashboard"}
      </h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {numericEntries.map(([key, value]) => (
          <div key={key} className="card">
            <p className="text-sm text-gray-500 mb-1">{formatLabel(key)}</p>
            <p className="text-2xl font-bold">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className={`grid gap-5 ${roleBreakdown ? "lg:grid-cols-2" : ""}`}>
        <div className="card">
          <h2 className="font-semibold mb-4">Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} interval={0} angle={-15} dy={10} height={60} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {roleBreakdown && (
          <div className="card">
            <h2 className="font-semibold mb-4">Users by role</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleBreakdown} dataKey="count" nameKey="role" outerRadius={90} label>
                    {roleBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 flex-wrap mt-2 text-sm">
              {roleBreakdown.map((r, i) => (
                <span key={r.role} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="font-semibold">{r.count}</span>
                  <span className="text-gray-500">{r.role}</span>
                </span>
              ))}
            </div>
            <Link href="/dashboard/admin/reports" className="text-brand-600 text-sm hover:underline mt-3 inline-block">
              Open full reports →
            </Link>
          </div>
        )}
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
