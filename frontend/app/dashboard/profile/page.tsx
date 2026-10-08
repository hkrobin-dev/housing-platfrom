"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";
import { useState } from "react";
import clsx from "clsx";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().max(20, "Phone is too long").optional().or(z.literal("")),
  avatarUrl: z
    .string()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\/.+/.test(v), "Avatar must be a valid URL or empty")
    .optional()
    .or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  const avatarPreview = watch("avatarUrl");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/users/me/profile");
        const p = data.data.user;
        reset({ name: p.name ?? "", phone: p.phone ?? "", avatarUrl: p.avatarUrl ?? "" });
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reset]);

  async function onSubmit(values: ProfileForm) {
    try {
      await api.patch("/users/me", {
        name: values.name,
        phone: values.phone || undefined,
        avatarUrl: values.avatarUrl || undefined,
      });
      toast.success("Profile updated successfully");
      await refreshUser();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <Loader label="Loading profile..." />;

  if (!user) {
    return (
      <EmptyState title="Not signed in" message="Please log in to manage your profile." />
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-1">Profile & Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        Signed in as <span className="font-medium">{user.email}</span> · Role:{" "}
        <span className="font-medium">{user.role}</span> ·{" "}
        {user.isVerified ? "Verified ✓" : "Unverified"}
      </p>

      {avatarPreview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarPreview}
          alt="Avatar preview"
          className="w-20 h-20 rounded-full object-cover border mb-4"
        />
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4" noValidate>
        <div>
          <label htmlFor="profile-name" className="text-sm font-medium mb-1 block">
            Full name
          </label>
          <input
            id="profile-name"
            className={clsx("input", errors.name && "border-red-500")}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="profile-phone" className="text-sm font-medium mb-1 block">
            Phone (optional)
          </label>
          <input
            id="profile-phone"
            className={clsx("input", errors.phone && "border-red-500")}
            placeholder="+880 1XXX-XXXXXX"
            {...register("phone")}
          />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label htmlFor="profile-avatar" className="text-sm font-medium mb-1 block">
            Avatar image URL (optional)
          </label>
          <input
            id="profile-avatar"
            className={clsx("input", errors.avatarUrl && "border-red-500")}
            placeholder="https://..."
            {...register("avatarUrl")}
          />
          {errors.avatarUrl && (
            <p className="text-xs text-red-600 mt-1">{errors.avatarUrl.message}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Paste a Cloudinary (or any https) image URL — a live preview appears above.
          </p>
        </div>
        <div>
          <span className="text-sm font-medium mb-1 block">Email</span>
          <input className="input bg-gray-50" value={user.email} disabled aria-label="Email (cannot be changed)" />
          <p className="text-xs text-gray-400 mt-1">Email and role cannot be changed here.</p>
        </div>
        <button className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
