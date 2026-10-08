"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api, getErrorMessage } from "@/lib/api";
import clsx from "clsx";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Home,
  Wrench,
  FolderOpen,
  Bell,
  Receipt,
  Users,
  MailWarning,
  UserRound,
  CreditCard,
  BarChart3,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";

const OWNER_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/earnings", label: "Earnings", icon: TrendingUp },
  { href: "/dashboard/profile", label: "Profile & Settings", icon: UserRound },
];

const TENANT_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/applications", label: "My Applications", icon: FileText },
  { href: "/dashboard/leases", label: "My Leases & Rent", icon: Home },
  { href: "/dashboard/viewing-requests", label: "Viewing Requests", icon: FileText },
  { href: "/dashboard/bills", label: "Utility Bills", icon: Receipt },
  { href: "/dashboard/payments", label: "Payments History", icon: CreditCard },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/dashboard/documents", label: "Documents", icon: FolderOpen },
  { href: "/dashboard/profile", label: "Profile & Settings", icon: UserRound },
];

const COMMON_LINKS = [{ href: "/dashboard/notifications", label: "Notifications", icon: Bell }];

const ADMIN_LINKS = [
  { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
  { href: "/dashboard/admin/subscriptions", label: "Plan Requests", icon: BadgeCheck },
  { href: "/dashboard/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Profile & Settings", icon: UserRound },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);

  const roleLinks =
    user?.role === "OWNER" || user?.role === "MANAGER"
      ? OWNER_LINKS
      : user?.role === "ADMIN"
      ? [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }, ...ADMIN_LINKS]
      : TENANT_LINKS;

  const links = [...roleLinks, ...COMMON_LINKS];

  async function resendVerification() {
    if (!user) return;
    setResending(true);
    try {
      await api.post("/auth/resend-verification", { email: user.email });
      setSent(true);
      toast.success("Verification email sent — check your inbox.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {user && !user.isVerified && (
        <div className="mb-6 flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <MailWarning size={16} className="shrink-0" />
            <span>Please verify your email address to unlock all features.</span>
          </div>
          <button
            onClick={resendVerification}
            disabled={resending || sent}
            className="whitespace-nowrap font-medium text-amber-900 hover:underline disabled:no-underline disabled:opacity-60"
          >
            {sent ? "Sent!" : resending ? "Sending..." : "Resend email"}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition",
                pathname === href
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}