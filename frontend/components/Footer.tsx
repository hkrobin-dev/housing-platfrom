import Link from "next/link";
import { Home, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-bold text-white text-lg mb-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center">
              <Home size={18} className="text-white" />
            </span>
            Housing Platform
          </div>
          <p className="text-sm text-gray-400 max-w-xs">
            Find rooms, match with roommates, and manage your entire tenancy — rent, bills, and
            maintenance — in one place.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/properties" className="hover:text-white transition-colors">
                Browse properties
              </Link>
            </li>
            <li>
              <Link href="/roommates" className="hover:text-white transition-colors">
                Find roommates
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white transition-colors">
                List your property
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Account</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/login" className="hover:text-white transition-colors">
                Login
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white transition-colors">
                Sign up
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-3 mt-4">
            {[Facebook, Twitter, Instagram].map((Icon, i) => (
              <span
                key={i}
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors cursor-pointer"
              >
                <Icon size={16} />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-gray-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Housing Platform. All rights reserved.</span>
          <span>Made for modern renting.</span>
        </div>
      </div>
    </footer>
  );
}
