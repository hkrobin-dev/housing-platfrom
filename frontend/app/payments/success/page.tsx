"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
      <h1 className="text-xl font-bold mb-2">Payment Successful</h1>
      <p className="text-gray-500 mb-6">Your payment has been confirmed. Thank you!</p>
      <Link href="/dashboard" className="btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
}
