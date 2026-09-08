"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { User, Role } from "@/lib/types";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import toast from "react-hot-toast";

interface AdminUser extends User {
  isBanned?: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/users", { params: { limit: 100 } });
      setUsers(data.data.users);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Users</h1>
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
            {users.map((u) => (
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
    </div>
  );
}
