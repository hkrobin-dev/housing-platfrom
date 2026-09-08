"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Role } from "@/lib/types";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("TENANT");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(name, email, password, role);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-6">Join as a tenant or list your property</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Full name</label>
            <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <input
              type="password"
              required
              minLength={8}
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              At least 8 characters, one uppercase letter, one number.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">I am a</label>
            <div className="grid grid-cols-3 gap-2">
              {(["TENANT", "OWNER", "MANAGER"] as Role[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`text-sm py-2 rounded-lg border ${
                    role === r
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {r === "TENANT" ? "Tenant" : r === "OWNER" ? "Owner" : "Manager"}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <GoogleLoginButton />
        <p className="text-xs text-gray-400 text-center mt-2">
          Signing up with Google always creates a Tenant account. Owners/Managers should
          use email &amp; password sign-up above.
        </p>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
