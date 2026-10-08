"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, getErrorMessage } from "@/lib/api";
import { Property } from "@/lib/types";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import { Plus, ArrowLeft, ArrowRight, Check } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

const wizardSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().optional().or(z.literal("")),
  type: z.enum(["APARTMENT", "HOUSE", "HOSTEL", "STUDIO"]),
  description: z.string().max(2000, "Description is too long").optional().or(z.literal("")),
  amenities: z.string().optional().or(z.literal("")),
});

type WizardForm = z.infer<typeof wizardSchema>;

const STEPS = ["Basics", "Details", "Review"] as const;

export default function OwnerPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Properties</h1>
          <p className="text-sm text-gray-500">Owner listings — rooms & leases are managed per property.</p>
        </div>
        <button
          onClick={() => setShowWizard((s) => !s)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> New Property
        </button>
      </div>

      {showWizard && (
        <CreatePropertyWizard
          onCreated={() => {
            setShowWizard(false);
            loadProperties();
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {loading ? (
        <Loader label="Loading properties..." />
      ) : properties.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No properties yet"
            message="List your first property with the 3-step wizard above — basics, details, review."
            actionLabel="Start the wizard"
            onAction={() => setShowWizard(true)}
          />
        </div>
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

function CreatePropertyWizard({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);

  const {
    register,
    trigger,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WizardForm>({
    resolver: zodResolver(wizardSchema),
    defaultValues: { type: "APARTMENT" },
    mode: "onTouched",
  });

  const values = watch();

  async function next() {
    const fields = step === 0 ? (["title", "address", "city", "type"] as const) : (["description", "amenities"] as const);
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  }

  async function onSubmit(data: WizardForm) {
    try {
      await api.post("/properties", {
        title: data.title,
        address: data.address,
        city: data.city || undefined,
        type: data.type,
        description: data.description || undefined,
        amenities: data.amenities
          ? data.amenities.split(",").map((a) => a.trim()).filter(Boolean)
          : undefined,
      });
      toast.success("Property created!");
      onCreated();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card mb-6 max-w-2xl" noValidate>
      <ol className="flex items-center gap-2 mb-6" aria-label="Creation progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <span
              className={clsx(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                i < step
                  ? "bg-emerald-500 text-white"
                  : i === step
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-500"
              )}
              aria-current={i === step ? "step" : undefined}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </span>
            <span className={clsx("text-xs font-medium", i === step ? "text-gray-900" : "text-gray-400")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px bg-gray-200 flex-1 mx-1" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-3">
          <div>
            <label htmlFor="wiz-title" className="text-sm font-medium mb-1 block">Title *</label>
            <input id="wiz-title" className={clsx("input", errors.title && "border-red-500")} placeholder="Sunny 3BHK near Gulshan" {...register("title")} />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label htmlFor="wiz-address" className="text-sm font-medium mb-1 block">Address *</label>
            <input id="wiz-address" className={clsx("input", errors.address && "border-red-500")} placeholder="House 12, Road 5, Gulshan" {...register("address")} />
            {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="wiz-city" className="text-sm font-medium mb-1 block">City</label>
              <input id="wiz-city" className="input" placeholder="Dhaka" {...register("city")} />
            </div>
            <div>
              <label htmlFor="wiz-type" className="text-sm font-medium mb-1 block">Type</label>
              <select id="wiz-type" className="input" {...register("type")}>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="HOSTEL">Hostel</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label htmlFor="wiz-desc" className="text-sm font-medium mb-1 block">Description</label>
            <textarea id="wiz-desc" rows={4} className={clsx("input", errors.description && "border-red-500")} placeholder="Bright rooms, attached bath, backup power..." {...register("description")} />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label htmlFor="wiz-amen" className="text-sm font-medium mb-1 block">Amenities (comma separated)</label>
            <input id="wiz-amen" className="input" placeholder="WiFi, Parking, Generator, Lift" {...register("amenities")} />
            <p className="text-xs text-gray-400 mt-1">e.g. WiFi, Parking, Generator</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm space-y-1.5">
          <p><span className="font-medium">Title:</span> {values.title}</p>
          <p><span className="font-medium">Address:</span> {values.address}{values.city ? `, ${values.city}` : ""}</p>
          <p><span className="font-medium">Type:</span> {values.type}</p>
          {values.description && <p><span className="font-medium">Description:</span> {values.description}</p>}
          {values.amenities && <p><span className="font-medium">Amenities:</span> {values.amenities}</p>}
          <p className="text-xs text-gray-500 pt-1">After creation, open the property to add rooms, set availability, and review applications.</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:underline">
          Cancel
        </button>
        <div className="flex gap-2">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-secondary inline-flex items-center gap-1">
              <ArrowLeft size={14} /> Back
            </button>
          )}
          {step < 2 ? (
            <button type="button" onClick={next} className="btn-primary inline-flex items-center gap-1">
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button className="btn-primary inline-flex items-center gap-1" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : (<><Check size={14} /> Create Property</>)}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
