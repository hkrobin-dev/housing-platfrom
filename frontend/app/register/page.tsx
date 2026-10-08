"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth-context";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import clsx from "clsx";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  role: z.enum(["TENANT", "OWNER", "MANAGER"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

const ROLE_OPTIONS: { value: RegisterForm["role"]; label: string }[] = [
  { value: "TENANT", label: "Tenant" },
  { value: "OWNER", label: "Owner" },
  { value: "MANAGER", label: "Manager" },
];

export default function RegisterPage() {
  const { register: signup } = useAuth();
  const {
    register: field,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "TENANT" },
  });

  const role = watch("role");

  async function onSubmit(values: RegisterForm) {
    await signup(values.name, values.email, values.password, values.role);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-6">Join as a tenant or list your property</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="text-sm font-medium mb-1 block">
              Full name
            </label>
            <input
              id="name"
              className={clsx("input", errors.name && "border-red-500")}
              placeholder="Jane Doe"
              {...field("name")}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium mb-1 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={clsx("input", errors.email && "border-red-500")}
              placeholder="you@example.com"
              {...field("email")}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium mb-1 block">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={clsx("input", errors.password && "border-red-500")}
              placeholder="••••••••"
              {...field("password")}
            />
            {errors.password ? (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                At least 8 characters, one uppercase letter, one number.
              </p>
            )}
          </div>
          <div>
            <span className="text-sm font-medium mb-1 block">I am a</span>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Choose your role">
              {ROLE_OPTIONS.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  role="radio"
                  aria-checked={role === r.value}
                  onClick={() => setValue("role", r.value)}
                  className={clsx(
                    "text-sm py-2 rounded-lg border transition",
                    role === r.value
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-brand-300"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <GoogleLoginButton />
        <p className="text-xs text-gray-400 text-center mt-2">
          Signing up with Google always creates a Tenant account. Owners/Managers should use email
          &amp; password sign-up above.
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
