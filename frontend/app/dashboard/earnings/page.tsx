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
} from "recharts";

interface OwnerStats {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  pendingApplications: number;
  activeLeases: number;
  totalRevenueCollected: number | string;
}

export default function EarningsPage() {
  return (
    <ProtectedRoute allow={["OWNER", "MANAGER", "ADMIN"]}>
      <EarningsContent />
    </ProtectedRoute>
  );
}

function EarningsContent() {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/owner")
      .then(({ data }) => setStats(data.data.stats))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading earnings..." />;
  if (!stats) return <p className="text-gray-500">No earnings data available.</p>;

  const occupancy = [
    { name: "Occupied", value: stats.occupiedRooms },
    { name: "Vacant", value: Math.max(stats.totalRooms - stats.occupiedRooms, 0) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Earnings & Analytics</h1>
      <p className="text-sm text-gray-500 mb-6">
        Revenue collected:{" "}
        <span className="font-semibold text-gray-900">
          ৳{Number(stats.totalRevenueCollected).toLocaleString()}
        </span>{" "}
        · Occupancy {stats.occupancyRate}% · {stats.activeLeases} active leases
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Total revenue</p>
          <p className="text-2xl font-bold">৳{Number(stats.totalRevenueCollected).toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Occupancy rate</p>
          <p className="text-2xl font-bold">{stats.occupancyRate}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Pending applications</p>
          <p className="text-2xl font-bold">{stats.pendingApplications}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Occupied vs vacant rooms</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
