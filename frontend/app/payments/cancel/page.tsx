"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
      <h1 className="text-xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-gray-500 mb-6">
        You cancelled the payment before completing it. No charge was made — your rent and bills
        remain pending and can be paid anytime.
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
