"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import { User, Role } from "@/lib/types";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminUser extends User {
  isBanned?: boolean;
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allow={["ADMIN"]}>
      <Suspense fallback={<Loader label="Loading users..." />}>
        <UsersContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function UsersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const roleFilter = searchParams.get("role") || "";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get("/users", { params: { page, limit: 20 } });
        setUsers(data.data.users);
        setTotalPages(data.data.pagination?.totalPages ?? 1);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  async function toggleBan(user: AdminUser) {
    setActingId(user.id);
    try {
      const { data } = await api.patch(`/users/${user.id}/ban`, { isBanned: !user.isBanned });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...data.data.user } : u)));
      toast.success(user.isBanned ? "User unbanned" : "User banned");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  async function verify(user: AdminUser) {
    setActingId(user.id);
    try {
      const { data } = await api.patch(`/users/${user.id}/verify`);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...data.data.user } : u)));
      toast.success("User verified");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  async function changeRole(user: AdminUser, role: Role) {
    if (role === user.role) return;
    setActingId(user.id);
    try {
      const { data } = await api.patch(`/users/${user.id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...data.data.user } : u)));
      toast.success(`Role updated to ${role}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  if (loading) return <Loader label="Loading users..." />;

  const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

  function pushParams(next: { page?: number; role?: string }) {
    const params = new URLSearchParams();
    const p = next.page ?? page;
    const r = next.role !== undefined ? next.role : roleFilter;
    if (p > 1) params.set("page", String(p));
    if (r) params.set("role", r);
    const qs = params.toString();
    router.push(`/dashboard/admin/users${qs ? `?${qs}` : ""}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">All Users</h1>
      <p className="text-sm text-gray-500 mb-4">Manage roles, verification, and bans. Page & role filter live in the URL.</p>

      <div className="flex gap-2 flex-wrap mb-4" role="tablist" aria-label="Filter by role">
        {["", "TENANT", "OWNER", "MANAGER", "ADMIN"].map((r) => (
          <button
            key={r || "all"}
            role="tab"
            aria-selected={roleFilter === r}
            onClick={() => pushParams({ role: r, page: 1 })}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
              roleFilter === r
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white text-gray-600 border-gray-300 hover:border-brand-300"
            }`}
          >
            {r || "All"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No users found"
            message="No users match this role filter on this page."
            actionLabel="Clear filter"
            onAction={() => pushParams({ role: "", page: 1 })}
          />
        </div>
      ) : (
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Role</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2">{u.name}</td>
                <td className="py-2 text-gray-500">{u.email}</td>
                <td className="py-2">
                  {u.role === "ADMIN" ? (
                    <Badge status={u.role} />
                  ) : (
                    <select
                      className="text-xs border border-gray-200 rounded px-1 py-0.5"
                      value={u.role}
                      disabled={actingId === u.id}
                      onChange={(e) => changeRole(u, e.target.value as Role)}
                    >
                      <option value="TENANT">TENANT</option>
                      <option value="OWNER">OWNER</option>
                      <option value="MANAGER">MANAGER</option>
                    </select>
                  )}
                </td>
                <td className="py-2 flex items-center gap-1">
                  {u.isBanned && <Badge status="INACTIVE" />}
                  {!u.isVerified && <Badge status="PENDING" />}
                  {u.isVerified && !u.isBanned && <Badge status="ACTIVE" />}
                </td>
                <td className="py-2 space-x-2">
                  {!u.isVerified && (
                    <button
                      onClick={() => verify(u)}
                      disabled={actingId === u.id}
                      className="btn-secondary text-xs px-2 py-1"
                    >
                      Verify
                    </button>
                  )}
                  {u.role !== "ADMIN" && (
                    <button
                      onClick={() => toggleBan(u)}
                      disabled={actingId === u.id}
                      className={u.isBanned ? "btn-secondary text-xs px-2 py-1" : "btn-danger text-xs px-2 py-1"}
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <nav className="flex items-center justify-center gap-2 mt-6" aria-label="Users pagination">
        <button
          className="btn-secondary !px-3 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => pushParams({ page: page - 1 })}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm text-gray-600" aria-live="polite">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn-secondary !px-3 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => pushParams({ page: page + 1 })}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
