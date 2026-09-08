"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import { Property, Room, Application, ViewingRequest, UtilityBill, MaintenanceRequest, Lease } from "@/lib/types";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import toast from "react-hot-toast";
import { Plus, Upload, Send } from "lucide-react";

type Tab = "rooms" | "images" | "leases" | "applications" | "viewings" | "bills" | "maintenance" | "settings";

export default function ManagePropertyPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [tab, setTab] = useState<Tab>("rooms");

  useEffect(() => {
    if (id) loadProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadProperty() {
    try {
      const { data } = await api.get(`/properties/${id}`);
      setProperty(data.data.property);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (!property) return <Loader label="Loading property..." />;

  const tabs: { key: Tab; label: string }[] = [
    { key: "rooms", label: "Rooms" },
    { key: "images", label: "Images" },
    { key: "leases", label: "Leases" },
    { key: "applications", label: "Applications" },
    { key: "viewings", label: "Viewing Requests" },
    { key: "bills", label: "Utility Bills" },
    { key: "maintenance", label: "Maintenance" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{property.title}</h1>
      <p className="text-gray-500 mb-6">{property.address}</p>

      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition ${
              tab === t.key ? "border-brand-500 text-brand-600 font-medium" : "border-transparent text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "rooms" && <RoomsTab propertyId={property.id} onChanged={loadProperty} />}
      {tab === "images" && <ImagesTab propertyId={property.id} images={property.images || []} onChanged={loadProperty} />}
      {tab === "leases" && <LeasesTab propertyId={property.id} />}
      {tab === "applications" && <ApplicationsTab propertyId={property.id} />}
      {tab === "viewings" && <ViewingsTab propertyId={property.id} />}
      {tab === "bills" && <BillsTab propertyId={property.id} />}
      {tab === "maintenance" && <MaintenanceTab propertyId={property.id} />}
      {tab === "settings" && <SettingsTab property={property} onChanged={loadProperty} />}
    </div>
  );
}

// ---------------- Rooms ----------------
function RoomsTab({ propertyId, onChanged }: { propertyId: string; onChanged: () => void }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [roomNo, setRoomNo] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [capacity, setCapacity] = useState("1");
  const [roomType, setRoomType] = useState("SINGLE");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/properties/${propertyId}/rooms`);
      setRooms(data.data.rooms);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post(`/properties/${propertyId}/rooms`, {
        roomNo,
        rentAmount: Number(rentAmount),
        capacity: Number(capacity),
        roomType,
        seatsLeft: Number(capacity),
      });
      toast.success("Room created!");
      setRoomNo("");
      setRentAmount("");
      setShowForm(false);
      load();
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary text-sm flex items-center gap-1">
          <Plus size={14} /> Add Room
        </button>
      </div>

      {showForm && (
        <form onSubmit={createRoom} className="card mb-4 grid sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs font-medium mb-1 block">Room No</label>
            <input required className="input" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Rent (৳/mo)</label>
            <input
              type="number"
              required
              className="input"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Capacity</label>
            <input
              type="number"
              min={1}
              className="input"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Type</label>
            <select className="input" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              <option value="SINGLE">Single</option>
              <option value="SHARED">Shared</option>
            </select>
          </div>
          <button className="btn-primary sm:col-span-4" disabled={creating}>
            {creating ? "Creating..." : "Create Room"}
          </button>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : rooms.length === 0 ? (
        <p className="text-gray-500 text-sm">No rooms yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {rooms.map((r) => (
            <div key={r.id} className="card">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Room {r.roomNo}</span>
                <Badge status={r.status} />
              </div>
              <p className="text-sm text-gray-500">
                ৳{Number(r.rentAmount).toLocaleString()}/mo · {r.roomType.toLowerCase()} · capacity {r.capacity}
              </p>
              <p className="text-xs text-gray-400">
                {r.availability?.[0]?.seatsLeft ?? "-"} seats left
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Applications ----------------
function ApplicationsTab({ propertyId }: { propertyId: string }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/applications/property/${propertyId}`);
      setApplications(data.data.applications);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  async function review(id: string, status: "APPROVED" | "REJECTED") {
    setActingId(id);
    try {
      await api.patch(`/applications/${id}/review`, { status });
      toast.success(status === "APPROVED" ? "Application approved — lease created!" : "Application rejected");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  if (loading) return <Loader />;
  if (applications.length === 0) return <p className="text-gray-500 text-sm">No applications yet.</p>;

  return (
    <div className="space-y-3">
      {applications.map((a) => (
        <div key={a.id} className="card flex items-center justify-between">
          <div>
            <p className="font-medium">{a.tenant?.name}</p>
            <p className="text-xs text-gray-500">
              Room {a.room?.roomNo} · applied {new Date(a.appliedAt).toLocaleDateString()}
            </p>
            {a.message && <p className="text-sm text-gray-600 mt-1">&quot;{a.message}&quot;</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge status={a.status} />
            {(a.status === "PENDING" || a.status === "UNDER_REVIEW") && (
              <>
                <button
                  onClick={() => review(a.id, "APPROVED")}
                  disabled={actingId === a.id}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  Approve
                </button>
                <button
                  onClick={() => review(a.id, "REJECTED")}
                  disabled={actingId === a.id}
                  className="btn-danger text-xs px-3 py-1.5"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------- Viewing Requests ----------------
function ViewingsTab({ propertyId }: { propertyId: string }) {
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/viewing-requests/property/${propertyId}`);
      setViewings(data.data.viewings);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    setActingId(id);
    try {
      await api.patch(`/viewing-requests/${id}/status`, { status });
      toast.success("Updated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  if (loading) return <Loader />;
  if (viewings.length === 0) return <p className="text-gray-500 text-sm">No viewing requests yet.</p>;

  return (
    <div className="space-y-3">
      {viewings.map((v) => (
        <div key={v.id} className="card flex items-center justify-between">
          <div>
            <p className="font-medium">{v.tenant?.name}</p>
            <p className="text-xs text-gray-500">
              Room {v.room?.roomNo} · requested {new Date(v.requestedDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge status={v.status} />
            {v.status === "PENDING" && (
              <>
                <button
                  onClick={() => updateStatus(v.id, "APPROVED")}
                  disabled={actingId === v.id}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(v.id, "REJECTED")}
                  disabled={actingId === v.id}
                  className="btn-danger text-xs px-3 py-1.5"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------- Utility Bills ----------------
function BillsTab({ propertyId }: { propertyId: string }) {
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [tenants, setTenants] = useState<{ id: string; name: string; email: string; roomNo: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [billType, setBillType] = useState("ELECTRICITY");
  const [totalAmount, setTotalAmount] = useState("");
  const [month, setMonth] = useState("");
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  async function loadTenants() {
    try {
      const { data } = await api.get(`/properties/${propertyId}/tenants`);
      setTenants(data.data.tenants);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  function toggleTenant(id: string) {
    setSelectedTenantIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/utility-bills/property/${propertyId}`);
      setBills(data.data.bills);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    loadTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  async function createBill(e: React.FormEvent) {
    e.preventDefault();
    if (selectedTenantIds.length === 0) return toast.error("Select at least one tenant to split the bill");
    setCreating(true);
    try {
      await api.post("/utility-bills", {
        propertyId,
        billType,
        totalAmount: Number(totalAmount),
        month,
        tenantIds: selectedTenantIds,
      });
      toast.success("Bill created and split!");
      setTotalAmount("");
      setSelectedTenantIds([]);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary text-sm flex items-center gap-1">
          <Plus size={14} /> New Bill
        </button>
      </div>

      {showForm && (
        <form onSubmit={createBill} className="card mb-4 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Bill type</label>
              <select className="input" value={billType} onChange={(e) => setBillType(e.target.value)}>
                <option value="ELECTRICITY">Electricity</option>
                <option value="WATER">Water</option>
                <option value="GAS">Gas</option>
                <option value="INTERNET">Internet</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Total amount (৳)</label>
              <input
                type="number"
                required
                className="input"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Month (YYYY-MM)</label>
              <input
                required
                placeholder="2026-09"
                className="input"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block">
              Split among (active tenants of this property)
            </label>
            {tenants.length === 0 ? (
              <p className="text-xs text-gray-400">
                No active tenants found — approve an application first to create a lease.
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {tenants.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTenantIds.includes(t.id)}
                      onChange={() => toggleTenant(t.id)}
                    />
                    <span>
                      {t.name} — Room {t.roomNo}{" "}
                      <span className="text-gray-400">({t.email})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <button className="btn-primary" disabled={creating}>
            {creating ? "Creating..." : "Create & Split Bill"}
          </button>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : bills.length === 0 ? (
        <p className="text-gray-500 text-sm">No utility bills yet.</p>
      ) : (
        <div className="space-y-3">
          {bills.map((b) => (
            <div key={b.id} className="card">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">
                  {b.billType} — {b.month}
                </p>
                <p className="text-sm text-gray-500">৳{Number(b.totalAmount).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(b.splits || []).map((s) => (
                  <span key={s.id} className="badge bg-gray-100 text-gray-700">
                    ৳{Number(s.shareAmount).toLocaleString()} · <Badge status={s.status} />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Maintenance ----------------
function MaintenanceTab({ propertyId }: { propertyId: string }) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/maintenance/property/${propertyId}`);
      setRequests(data.data.requests);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  async function updateStatus(id: string, status: string) {
    setActingId(id);
    try {
      await api.patch(`/maintenance/${id}/status`, { status });
      toast.success("Status updated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  if (loading) return <Loader />;
  if (requests.length === 0) return <p className="text-gray-500 text-sm">No maintenance requests yet.</p>;

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="card">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="font-medium">{r.title}</p>
              <p className="text-xs text-gray-500">
                Room {r.room?.roomNo} · {r.tenant?.name} · priority {r.priority.toLowerCase()}
              </p>
            </div>
            <Badge status={r.status} />
          </div>
          <p className="text-sm text-gray-600 mb-3">{r.description}</p>
          <div className="flex gap-2">
            {(["OPEN", "IN_PROGRESS", "RESOLVED"] as const)
              .filter((s) => s !== r.status)
              .map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(r.id, s)}
                  disabled={actingId === r.id}
                  className="btn-secondary text-xs px-2 py-1"
                >
                  Mark {s.replace("_", " ").toLowerCase()}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------- Images ----------------
function ImagesTab({
  propertyId,
  images,
  onChanged,
}: {
  propertyId: string;
  images: string[];
  onChanged: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputId = "property-images-input";

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("images", f));

    setUploading(true);
    try {
      await api.post(`/properties/${propertyId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Images uploaded!");
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label htmlFor={fileInputId} className="btn-primary inline-flex items-center gap-2 cursor-pointer mb-4">
        <Upload size={16} /> {uploading ? "Uploading..." : "Upload Images"}
      </label>
      <input
        id={fileInputId}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />

      {images.length === 0 ? (
        <p className="text-gray-500 text-sm">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt={`Property image ${i + 1}`} className="rounded-lg h-32 w-full object-cover" />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Leases ----------------
function LeasesTab({ propertyId }: { propertyId: string }) {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/leases/property/${propertyId}`);
      setLeases(data.data.leases);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  async function generateSchedule(leaseId: string) {
    setActingId(leaseId);
    try {
      await api.post(`/rent-payments/lease/${leaseId}/generate`, { months: 12 });
      toast.success("12-month rent schedule generated!");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  async function terminate(leaseId: string) {
    setActingId(leaseId);
    try {
      await api.patch(`/leases/${leaseId}/terminate`);
      toast.success("Lease terminated, seat released");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  if (loading) return <Loader />;
  if (leases.length === 0) return <p className="text-gray-500 text-sm">No leases yet for this property.</p>;

  return (
    <div className="space-y-3">
      {leases.map((l) => (
        <div key={l.id} className="card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium">{l.tenant?.name}</p>
              <p className="text-xs text-gray-500">
                Room {l.room?.roomNo} · ৳{Number(l.rentAmount).toLocaleString()}/mo · since{" "}
                {new Date(l.startDate).toLocaleDateString()}
              </p>
            </div>
            <Badge status={l.status} />
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {l.rentPayments?.length || 0} rent record(s) generated
          </p>
          {l.status === "ACTIVE" && (
            <div className="flex gap-2">
              <button
                onClick={() => generateSchedule(l.id)}
                disabled={actingId === l.id}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <Send size={12} /> Generate 12mo Rent Schedule
              </button>
              <button
                onClick={() => terminate(l.id)}
                disabled={actingId === l.id}
                className="btn-danger text-xs px-3 py-1.5"
              >
                Terminate Lease
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------- Settings (Manager assignment) ----------------
function SettingsTab({ property, onChanged }: { property: Property; onChanged: () => void }) {
  const [managerEmail, setManagerEmail] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function assignManager(e: React.FormEvent) {
    e.preventDefault();
    setAssigning(true);
    try {
      await api.patch(`/properties/${property.id}/manager`, { email: managerEmail });
      toast.success("Manager assigned successfully!");
      setManagerEmail("");
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  }

  async function removeManager() {
    setRemoving(true);
    try {
      await api.delete(`/properties/${property.id}/manager`);
      toast.success("Manager removed");
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="max-w-md">
      <h3 className="font-semibold mb-3">Property Manager</h3>
      {property.managerId ? (
        <div className="card flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">A manager is currently assigned to this property.</p>
          <button onClick={removeManager} disabled={removing} className="btn-danger text-xs px-3 py-1.5">
            {removing ? "Removing..." : "Remove Manager"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">No manager assigned yet — you&apos;re managing this property directly.</p>
      )}

      <form onSubmit={assignManager} className="card space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Assign a manager by email</label>
          <input
            type="email"
            required
            placeholder="manager@example.com"
            className="input"
            value={managerEmail}
            onChange={(e) => setManagerEmail(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">
            The user must already have an account. If they&apos;re currently a Tenant, they&apos;ll
            be automatically promoted to Manager.
          </p>
        </div>
        <button className="btn-primary" disabled={assigning}>
          {assigning ? "Assigning..." : "Assign Manager"}
        </button>
      </form>
    </div>
  );
}
