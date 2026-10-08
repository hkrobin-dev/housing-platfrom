"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error("Could not load this dashboard section. Please try again.");
  }, [error]);

  return (
    <div className="text-center py-16">
      <h1 className="text-xl font-bold mb-2">Couldn&apos;t load this section</h1>
      <p className="text-gray-500 text-sm mb-6">
        Something went wrong on our side. Your data is safe — please retry.
      </p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  );
}
