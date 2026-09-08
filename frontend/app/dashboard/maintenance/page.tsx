"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { MaintenanceRequest, Lease } from "@/lib/types";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function MyMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [reqRes, leaseRes] = await Promise.all([
        api.get("/maintenance/my"),
        api.get("/leases/my"),
      ]);
      setRequests(reqRes.data.data.requests);
      setLeases(leaseRes.data.data.leases);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createRequest(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/maintenance", { roomId, title, description, priority });
      toast.success("Maintenance request submitted!");
      setTitle("");
      setDescription("");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Maintenance Requests</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Request
        </button>
      </div>

      {showForm && (
        <form onSubmit={createRequest} className="card mb-6 space-y-3 max-w-lg">
          <div>
            <label className="text-sm font-medium mb-1 block">Room (from your active lease)</label>
            <select required className="input" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              <option value="">Select a room</option>
              {leases.map((l) => (
                <option key={l.roomId} value={l.roomId}>
                  {l.room?.property?.title} — Room {l.room?.roomNo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <input required className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea
              required
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Priority</label>
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <button className="btn-primary" disabled={creating}>
            {creating ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      {requests.length === 0 ? (
        <p className="text-gray-500">No maintenance requests yet.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="card">
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium">{r.title}</p>
                <Badge status={r.status} />
              </div>
              <p className="text-sm text-gray-600">{r.description}</p>
              <p className="text-xs text-gray-400 mt-1">Priority: {r.priority.toLowerCase()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
