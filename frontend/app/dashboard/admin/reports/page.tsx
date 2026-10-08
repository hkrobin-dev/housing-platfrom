"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
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

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalRooms: number;
  totalLeases: number;
  totalRevenue: number | string;
  usersByRole: { role: string; count: number }[];
}

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function AdminReportsPage() {
  return (
    <ProtectedRoute allow={["ADMIN"]}>
      <ReportsContent />
    </ProtectedRoute>
  );
}

function ReportsContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/admin")
      .then(({ data }) => setStats(data.data.stats))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading reports..." />;
  if (!stats) return <p className="text-gray-500">No report data available.</p>;

  const platformBars = [
    { name: "Users", value: stats.totalUsers },
    { name: "Properties", value: stats.totalProperties },
    { name: "Rooms", value: stats.totalRooms },
    { name: "Leases", value: stats.totalLeases },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Reports & Analytics</h1>
      <p className="text-sm text-gray-500 mb-6">
        Platform-wide totals · Revenue collected: ৳{Number(stats.totalRevenue).toLocaleString()}
      </p>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold mb-4">Platform inventory</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformBars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Users by role</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.usersByRole} dataKey="count" nameKey="role" outerRadius={90} label>
                  {stats.usersByRole.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 flex-wrap mt-2 text-sm">
            {stats.usersByRole.map((r, i) => (
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
        </div>
      </div>
    </div>
  );
}
