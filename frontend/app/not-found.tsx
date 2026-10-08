import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-100">404</p>
      <h1 className="text-2xl font-bold mt-2 mb-2">Page not found</h1>
      <p className="text-gray-500 text-sm mb-6">
        The room you&apos;re looking for doesn&apos;t exist — or it was just rented out.
      </p>
      <Link href="/" className="btn-primary inline-flex items-center gap-2">
        <Home size={16} /> Back to home
      </Link>
    </div>
  );
}
