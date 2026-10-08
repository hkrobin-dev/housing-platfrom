"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentFailPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <XCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h1 className="text-xl font-bold mb-2">Payment Failed</h1>
      <p className="text-gray-500 mb-6">
        The gateway could not complete your payment. No money was taken — please check your
        payment details and try again.
      </p>
      <div className="flex gap-2 justify-center">
        <Link href="/dashboard/payments" className="btn-primary">
          View payment history
        </Link>
        <Link href="/dashboard" className="btn-secondary">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
