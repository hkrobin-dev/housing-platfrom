"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled page error:", error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <TriangleAlert className="mx-auto text-amber-500 mb-4" size={44} />
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-gray-500 text-sm mb-6">
        We couldn&apos;t load this page. Check your connection and try again — your data is safe.
      </p>
      <div className="flex gap-2 justify-center">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <a href="/" className="btn-secondary">
          Go home
        </a>
      </div>
    </div>
  );
}
