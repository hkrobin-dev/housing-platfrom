"use client";

import { useEffect, useState, useRef } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { DocumentItem, Lease } from "@/lib/types";
import Loader from "@/components/Loader";
import { Upload, FileText, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [type, setType] = useState("OTHER");
  const [leaseId, setLeaseId] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const [docsRes, leasesRes] = await Promise.all([
        api.get("/documents/my"),
        api.get("/leases/my").catch(() => ({ data: { data: { leases: [] } } })), // owners/managers have no "my leases"
      ]);
      setDocuments(docsRes.data.data.documents);
      setLeases(leasesRes.data.data.leases);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Choose a file first");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    if (leaseId) formData.append("leaseId", leaseId);

    setUploading(true);
    try {
      await api.post("/documents", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Document uploaded!");
      if (fileRef.current) fileRef.current.value = "";
      setLeaseId("");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/documents/${id}`);
      toast.success("Document deleted");
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Documents</h1>

      <form onSubmit={handleUpload} className="card mb-6 max-w-lg space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Document type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="NID">NID / ID</option>
            <option value="LEASE_AGREEMENT">Lease Agreement</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {leases.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Link to a lease <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select className="input" value={leaseId} onChange={(e) => setLeaseId(e.target.value)}>
              <option value="">Not linked to a lease</option>
              {leases.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.room?.property?.title} — Room {l.room?.roomNo}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-1 block">File (image or PDF, max 5MB)</label>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="input" />
        </div>
        <button className="btn-primary flex items-center gap-2" disabled={uploading}>
          <Upload size={16} /> {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {loading ? (
        <Loader />
      ) : documents.length === 0 ? (
        <p className="text-gray-500">No documents uploaded yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {documents.map((d) => (
            <div key={d.id} className="card flex items-center gap-3 hover:shadow-md transition">
              <a href={d.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="text-brand-500 shrink-0" size={22} />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{d.fileName || d.type}</p>
                  <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
              </a>
              <button
                onClick={() => handleDelete(d.id)}
                disabled={deletingId === d.id}
                className="text-gray-400 hover:text-red-600 shrink-0"
                aria-label="Delete document"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
