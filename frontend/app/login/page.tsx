"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth-context";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import clsx from "clsx";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-gray-500">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || undefined;
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    await login(values.email, values.password, next);
  }

  async function handleDemoLogin(email: string, password: string, role: string) {
    setDemoLoading(role);
    try {
      await login(email, password, next);
    } catch {
      // login() already toasted the error — just reset the button state
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold mb-1">Welcome back 👋</h1>
        <p className="text-gray-500 text-sm mb-6">Log in to your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="text-sm font-medium mb-1 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={clsx("input", errors.email && "border-red-500")}
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="text-sm font-medium block">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={clsx("input", errors.password && "border-red-500")}
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>
          <button className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "🔐 Login"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <GoogleLoginButton />

        <div className="mt-6 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 p-4">
          <p className="text-sm font-semibold text-center mb-1">🚀 Quick Demo Login</p>
          <p className="text-xs text-gray-500 text-center mb-3">
            One click — no typing needed. Seeded via backend <code>npm run seed</code>.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map(({ role, description, icon: Icon, email, password }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleDemoLogin(email, password, role)}
                disabled={demoLoading !== null}
                title={`${email} / ${password}`}
                className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-3 text-center shadow-sm hover:border-brand-400 hover:shadow transition disabled:opacity-60"
              >
                <Icon size={18} className="text-brand-600" />
                <span className="text-xs font-semibold">{role}</span>
                <span className="text-[10px] leading-tight text-gray-500 hidden sm:block">
                  {description}
                </span>
                <span className="text-xs font-medium text-brand-600">
                  {demoLoading === role ? "Logging in..." : "Demo Login"}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-0.5 text-[11px] text-gray-500">
            <p>
              <span className="font-medium">Admin:</span> admin@housing.com / Admin@12345
            </p>
            <p>
              <span className="font-medium">Owner:</span> owner@housing.com / Owner@12345
            </p>
            <p>
              <span className="font-medium">Tenant:</span> tenant@housing.com / Tenant@12345
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
