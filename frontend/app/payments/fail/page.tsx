"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentFailPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <XCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h1 className="text-xl font-bold mb-2">Payment Failed</h1>
      <p className="text-gray-500 mb-6">Something went wrong processing your payment. Please try again.</p>
      <Link href="/dashboard" className="btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
}
