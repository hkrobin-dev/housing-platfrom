"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { api, getErrorMessage } from "./api";
import { User, Role } from "./types";
import toast from "react-hot-toast";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role, redirectTo?: string) => Promise<void>;
  loginWithGoogle: (idToken: string, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function refreshUser() {
    const token = Cookies.get("accessToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persistSession(accessToken: string, refreshToken: string, sessionUser: User) {
    Cookies.set("accessToken", accessToken, { expires: 1 });
    Cookies.set("refreshToken", refreshToken, { expires: 7 });
    setUser(sessionUser);
  }

  function safeRedirect(to?: string) {
    return to && to.startsWith("/") && !to.startsWith("//") ? to : "/dashboard";
  }

  async function login(email: string, password: string, redirectTo?: string) {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      persistSession(data.data.accessToken, data.data.refreshToken, data.data.user);
      toast.success("Logged in successfully");
      router.push(safeRedirect(redirectTo));
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  }

  async function register(name: string, email: string, password: string, role: Role, redirectTo?: string) {
    try {
      const { data } = await api.post("/auth/register", { name, email, password, role });
      persistSession(data.data.accessToken, data.data.refreshToken, data.data.user);
      toast.success("Account created successfully");
      router.push(safeRedirect(redirectTo));
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  }

  async function loginWithGoogle(idToken: string, redirectTo?: string) {
    try {
      const { data } = await api.post("/auth/google", { idToken });
      persistSession(data.data.accessToken, data.data.refreshToken, data.data.user);
      toast.success("Logged in with Google successfully");
      router.push(safeRedirect(redirectTo));
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore — we clear local session regardless
    }
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
