"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Home, LayoutDashboard, Users, LogOut, Menu, X } from "lucide-react";
import clsx from "clsx";

const PUBLIC_LINKS = [
  { href: "/properties", label: "Browse" },
  { href: "/roommates", label: "Roommates", icon: Users },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="glass border-b border-gray-200/70 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg group">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Home size={18} className="text-white" />
          </span>
          <span className="text-gray-900">
            Housing<span className="text-gradient"> Platform</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1 text-sm">
          {PUBLIC_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors",
                isActive(href)
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-gray-600 hover:text-brand-600 hover:bg-gray-50"
              )}
            >
              {Icon && <Icon size={16} />} {label}
            </Link>
          ))}

          {!loading && user && (
            <Link
              href="/dashboard"
              className={clsx(
                "px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors",
                isActive("/dashboard")
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-gray-600 hover:text-brand-600 hover:bg-gray-50"
              )}
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}

          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="px-3 py-2 rounded-lg text-gray-600 hover:text-brand-600 hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
              <Link href="/register" className="btn-primary text-sm ml-1 shadow-md">
                Sign up free
              </Link>
            </>
          )}

          {!loading && user && (
            <button
              onClick={() => logout()}
              className="px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="sm:hidden animate-slide-up border-t border-gray-100 bg-white px-4 py-3 space-y-1 text-sm">
          {PUBLIC_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                "px-3 py-2.5 rounded-lg flex items-center gap-2 transition-colors",
                isActive(href)
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {Icon && <Icon size={16} />} {label}
            </Link>
          ))}
          {!loading && user && (
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-gray-50"
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}
          {!loading && !user && (
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 text-center">
                Login
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-center">
                Sign up free
              </Link>
            </div>
          )}
          {!loading && user && (
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="w-full px-3 py-2.5 rounded-lg flex items-center gap-2 text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
