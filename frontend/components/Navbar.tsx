"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Home, LayoutDashboard, Users, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-600 text-lg">
          <Home size={22} />
          Housing Platform
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/properties" className="text-gray-600 hover:text-brand-600">
            Browse
          </Link>
          <Link href="/roommates" className="text-gray-600 hover:text-brand-600 flex items-center gap-1">
            <Users size={16} /> Roommates
          </Link>

          {!loading && user && (
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-brand-600 flex items-center gap-1"
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}

          {!loading && !user && (
            <>
              <Link href="/login" className="text-gray-600 hover:text-brand-600">
                Login
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Sign up
              </Link>
            </>
          )}

          {!loading && user && (
            <button
              onClick={() => logout()}
              className="text-gray-600 hover:text-red-600 flex items-center gap-1"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
