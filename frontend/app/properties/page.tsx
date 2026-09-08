"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, getErrorMessage } from "@/lib/api";
import { Property } from "@/lib/types";
import Loader from "@/components/Loader";
import { MapPin, Home as HomeIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function PropertiesPage() {
  return (
    <Suspense fallback={<Loader label="Loading properties..." />}>
      <PropertiesContent />
    </Suspense>
  );
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(searchParams.get("city") || "");

  async function fetchProperties(cityFilter?: string) {
    setLoading(true);
    try {
      const { data } = await api.get("/properties", {
        params: cityFilter ? { city: cityFilter } : {},
      });
      setProperties(data.data.properties);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties(searchParams.get("city") || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/properties${city ? `?city=${encodeURIComponent(city)}` : ""}`);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Browse Properties</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-md">
        <input
          className="input"
          placeholder="Filter by city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button className="btn-primary whitespace-nowrap">Search</button>
      </form>

      {loading ? (
        <Loader label="Loading properties..." />
      ) : properties.length === 0 ? (
        <p className="text-gray-500">No properties found. Try a different city.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => (
            <Link key={p.id} href={`/properties/${p.id}`} className="card hover:shadow-md transition block">
              <div className="h-36 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <HomeIcon className="text-gray-300" size={32} />
                )}
              </div>
              <h3 className="font-semibold mb-1">{p.title}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                <MapPin size={14} /> {p.city || p.address}
              </p>
              <p className="text-xs text-gray-400">
                {p.rooms?.length || 0} room{(p.rooms?.length || 0) !== 1 ? "s" : ""} listed
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
