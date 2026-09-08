"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, getErrorMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import { CheckCircle2, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loader />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token. Please use the link from your email.");
      return;
    }
    api
      .post("/auth/verify-email", { token })
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(getErrorMessage(err));
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {status === "loading" && <Loader label="Verifying your email..." />}

      {status === "success" && (
        <>
          <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
          <h1 className="text-xl font-bold mb-2">Email Verified!</h1>
          <p className="text-gray-500 mb-6">Your email has been confirmed successfully.</p>
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-xl font-bold mb-2">Verification Failed</h1>
          <p className="text-gray-500 mb-6">{message}</p>
          <Link href="/dashboard" className="btn-secondary">
            Go to Dashboard
          </Link>
        </>
      )}
    </div>
  );
}