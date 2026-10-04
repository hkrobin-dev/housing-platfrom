"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api, getErrorMessage } from "@/lib/api";
import { Property } from "@/lib/types";
import { getPropertyImage } from "@/lib/property-images";
import Loader from "@/components/Loader";
import SkeletonGrid from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { MapPin, ArrowRight } from "lucide-react";
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
        <SkeletonGrid count={6} />
      ) : properties.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No properties found"
            message="Try a different city, or clear the filter to browse everything."
            actionLabel="Clear filter"
            onAction={() => {
              setCity("");
              router.push("/properties");
            }}
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p, i) => (
            <Link
              key={p.id}
              href={`/properties/${p.id}`}
              className="card !p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 block overflow-hidden animate-fade-in-up group"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <div className="h-44 rounded-xl mb-3 overflow-hidden relative bg-gray-100">
                <Image
                  src={p.images?.[0] || getPropertyImage(p.id)}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 badge bg-white/90 backdrop-blur text-brand-700 shadow-sm">
                  {p.rooms?.length || 0} room{(p.rooms?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-brand-600 transition-colors line-clamp-1">
                {p.title}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                <MapPin size={14} className="text-brand-500 shrink-0" /> {p.city || p.address}
              </p>
              <span className="text-xs font-medium text-brand-600 inline-flex items-center gap-1">
                View details <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
