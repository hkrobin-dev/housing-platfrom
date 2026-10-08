"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function PropertiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error("Could not load properties. Please try again.");
  }, [error]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="text-xl font-bold mb-2">Couldn&apos;t load properties</h1>
      <p className="text-gray-500 text-sm mb-6">
        Something went wrong while fetching listings. Check your connection and retry.
      </p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  );
}
