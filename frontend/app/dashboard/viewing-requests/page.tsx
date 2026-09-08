"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { ViewingRequest } from "@/lib/types";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import toast from "react-hot-toast";

export default function MyViewingRequestsPage() {
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/viewing-requests/my")
      .then(({ data }) => setViewings(data.data.viewings))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Viewing Requests</h1>
      {viewings.length === 0 ? (
        <p className="text-gray-500">No viewing requests yet. Browse properties to request one.</p>
      ) : (
        <div className="space-y-3">
          {viewings.map((v) => (
            <div key={v.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{v.property?.title}</p>
                <p className="text-xs text-gray-500">
                  Room {v.room?.roomNo} · requested {new Date(v.requestedDate).toLocaleDateString()}
                </p>
              </div>
              <Badge status={v.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
