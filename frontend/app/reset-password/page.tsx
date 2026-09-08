"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, getErrorMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return toast.error("Missing or invalid reset link");
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      toast.success("Password reset! Please log in.");
      router.push("/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold mb-1">Reset password</h1>
        <p className="text-gray-500 text-sm mb-6">Choose a new password for your account.</p>

        {!token ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
            This reset link is missing or invalid. Please request a new one.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">New password</label>
              <input
                type="password"
                required
                minLength={8}
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                At least 8 characters, one uppercase letter, one number.
              </p>
            </div>
            <button className="btn-primary w-full" disabled={submitting}>
              {submitting ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-500 mt-4 text-center">
          <Link href="/login" className="text-brand-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
