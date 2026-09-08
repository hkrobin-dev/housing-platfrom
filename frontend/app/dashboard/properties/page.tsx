"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getErrorMessage } from "@/lib/api";
import { Property } from "@/lib/types";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function OwnerPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("APARTMENT");

  async function loadProperties() {
    setLoading(true);
    try {
      const { data } = await api.get("/properties/my");
      setProperties(data.data.properties);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  async function createProperty(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/properties", { title, address, city, type });
      toast.success("Property created!");
      setTitle("");
      setAddress("");
      setCity("");
      setShowForm(false);
      loadProperties();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Properties</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Property
        </button>
      </div>

      {showForm && (
        <form onSubmit={createProperty} className="card mb-6 space-y-3 max-w-lg">
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <input required className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Address</label>
            <input required className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">City</label>
              <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="HOSTEL">Hostel</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" disabled={creating}>
            {creating ? "Creating..." : "Create Property"}
          </button>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : properties.length === 0 ? (
        <p className="text-gray-500">No properties yet. Create your first one above.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {properties.map((p) => (
            <Link key={p.id} href={`/dashboard/properties/${p.id}`} className="card block hover:shadow-md transition">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold">{p.title}</h3>
                <Badge status={p.status} />
              </div>
              <p className="text-sm text-gray-500">{p.address}</p>
              <p className="text-xs text-gray-400 mt-2">{p.rooms?.length || 0} rooms</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
