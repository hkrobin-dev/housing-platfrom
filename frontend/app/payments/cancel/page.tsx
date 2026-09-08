"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
      <h1 className="text-xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-gray-500 mb-6">You cancelled the payment. No charge was made.</p>
      <Link href="/dashboard" className="btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
}
