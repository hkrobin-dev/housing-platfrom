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
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const TYPES = ["", "APARTMENT", "HOUSE", "HOSTEL", "STUDIO"] as const;
const PAGE_SIZE = 9;

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

  const city = searchParams.get("city") || "";
  const type = searchParams.get("type") || "";
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const [properties, setProperties] = useState<Property[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cityInput, setCityInput] = useState(city);

  useEffect(() => {
    setCityInput(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        const { data } = await api.get("/properties", {
          params: {
            ...(city ? { city } : {}),
            ...(type ? { type } : {}),
            page,
            limit: PAGE_SIZE,
          },
        });
        setProperties(data.data.properties);
        setTotalPages(data.data.pagination?.totalPages ?? 1);
        setTotal(data.data.pagination?.total ?? data.data.properties.length);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, [city, type, page]);

  function pushParams(next: { city?: string; type?: string; page?: number }) {
    const params = new URLSearchParams();
    const c = next.city ?? city;
    const t = next.type ?? type;
    const p = next.page ?? page;
    if (c) params.set("city", c);
    if (t) params.set("type", t);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    router.push(`/properties${qs ? `?${qs}` : ""}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ city: cityInput.trim(), page: 1 });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Browse Properties</h1>
      <p className="text-sm text-gray-500 mb-4">
        {total} {total === 1 ? "property" : "properties"} · filters live in the URL, share any view
      </p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4 max-w-2xl">
        <input
          className="input flex-1"
          placeholder="Filter by city"
          aria-label="Filter by city"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
        />
        <select
          className="input sm:w-44"
          aria-label="Filter by property type"
          value={type}
          onChange={(e) => pushParams({ type: e.target.value, page: 1 })}
        >
          <option value="">All types</option>
          {TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <button className="btn-primary whitespace-nowrap">Search</button>
        {(city || type) && (
          <button
            type="button"
            className="btn-secondary whitespace-nowrap"
            onClick={() => {
              setCityInput("");
              router.push("/properties");
            }}
          >
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : properties.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No properties found"
            message="Try a different city or type, or clear the filters to browse everything."
            actionLabel="Clear filters"
            onAction={() => {
              setCityInput("");
              router.push("/properties");
            }}
          />
        </div>
      ) : (
        <>
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

          <nav
            className="flex items-center justify-center gap-2 mt-8"
            aria-label="Properties pagination"
          >
            <button
              className="btn-secondary !px-3 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => pushParams({ page: page - 1 })}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600" aria-live="polite">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn-secondary !px-3 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => pushParams({ page: page + 1 })}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
