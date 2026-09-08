"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Role } from "@/lib/types";
import Loader from "./Loader";

export default function ProtectedRoute({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow?: Role[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && allow && !allow.includes(user.role)) router.replace("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  if (loading || !user) return <Loader label="Checking your session..." />;
  if (allow && !allow.includes(user.role)) return <Loader label="Redirecting..." />;

  return <>{children}</>;
}
