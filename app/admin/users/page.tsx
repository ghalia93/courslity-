"use client";

// Renders the admin users page.
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import {
  BadgeCheck,
  Plus,
  Search,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import AddAdminCard, { type AdminUser } from "@/components/admin/AddAdminCard";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useAuth } from "@/context/AuthContext";

type UserRow = {
  id: number;
  name: string;
  email: string;
  university: string | null;
  role: string;
  joined: string;
  active: boolean;
  verified: boolean;
  protected?: boolean;
};

type ApiResponse = {
  users: {
    id: number;
    name: string;
    email: string;
    university: string | null;
    role: string;
    joined: string;
    active?: boolean;
    verified?: boolean;
    isProtected?: boolean;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

type VerificationFilter = "all" | "pending" | "verified";

function dateOnly(x: string | Date | null | undefined) {
  if (!x) return "";
  return String(x).slice(0, 10);
}

const verificationFilters: {
  label: string;
  value: VerificationFilter;
}[] = [
  { label: "All users", value: "all" },
  { label: "Pending verification", value: "pending" },
  { label: "Verified", value: "verified" },
];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationFilter, setVerificationFilter] =
    useState<VerificationFilter>("all");
  const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const [debouncedQ, setDebouncedQ] = useState(searchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  async function loadUsers(
    p: number,
    q: string,
    verification: VerificationFilter,
  ) {
    setLoading(true);
    setErrorMsg("");

    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(limit));
      if (q.trim()) params.set("q", q.trim());
      if (verification !== "all") params.set("verification", verification);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to load users");
      }

      const payload = data as ApiResponse;

      const mapped: UserRow[] = (payload.users || []).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        university: u.university ?? null,
        role: u.role || "admin",
        joined: dateOnly(u.joined),
        active: u.active !== false,
        verified: !!u.verified,
        protected: !!u.isProtected,
      }));

      setUsers(mapped);
      setTotal(payload.pagination?.total || 0);
    } catch (e: unknown) {
      setUsers([]);
      setTotal(0);
      setErrorMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(page, debouncedQ, verificationFilter);
  }, [page, debouncedQ, verificationFilter]);

  const displayUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      const ap = a.protected ? 1 : 0;
      const bp = b.protected ? 1 : 0;
      return bp - ap;
    });
  }, [users]);

  function handleDelete(u: UserRow) {
    if (u.protected || !u.active) return;
    setPendingDelete(u);
  }

  async function updateUserAction(
    userId: number,
    action: "verify" | "activate" | "deactivate",
  ) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.message || `Failed to ${action} user`);
    }

    loadUsers(page, debouncedQ, verificationFilter);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    try {
      await updateUserAction(pendingDelete.id, "deactivate");
      setPendingDelete(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to deactivate user");
    }
  }

  async function handleVerify(u: UserRow) {
    try {
      await updateUserAction(u.id, "verify");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to verify user");
    }
  }

  async function handleActivate(u: UserRow) {
    try {
      await updateUserAction(u.id, "activate");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to activate user");
    }
  }

  async function createAdmin(admin: AdminUser) {
  try {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: admin.name.trim(),
        email: admin.email.trim(),
        password: admin.password,
        role: admin.role,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.message || "Failed to create admin");
      return;
    }

    setShowAdminForm(false);
    setPage(1);
    loadUsers(1, debouncedQ, verificationFilter);
  } catch {
    alert("Failed to create admin");
  }
}

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {pendingDelete && (
        <ConfirmModal
          title="Deactivate user?"
          description={
            <>
              Are you sure you want to deactivate{" "}
              <span className="font-medium text-gray-700">
                {pendingDelete.name}
              </span>{" "}
              (
              <span className="font-mono text-gray-600">
                {pendingDelete.email}
              </span>
              )? Their reviews and feedback will stay visible to other users.
            </>
          }
          confirmText="Deactivate"
          cancelText="Cancel"
          variant="danger"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">User Management</h1>
          <p className="text-sm text-gray-500">
            Manage platform users and admin access
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAdminForm(true)}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> Add Admin
        </Button>
      </div>

      {showAdminForm && (
        <div className="mt-4">
          <AddAdminCard
            onClose={() => setShowAdminForm(false)}
            onSave={createAdmin}
            canCreateUniversityAdmin={user?.role === "super_admin"}
          />
        </div>
      )}

      <div className="mt-4 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search for a user..."
          className="w-full h-11 pl-10 pr-4 rounded-md border border-gray-300
          focus:outline-none focus:ring-2 focus:ring-[#6155F5]
          focus:border-[#6155F5]"
        />
      </div>

      <div className="mt-4 inline-flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-1">
        {verificationFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setVerificationFilter(filter.value);
              setPage(1);
            }}
            className={`rounded-md px-3 py-2 text-sm transition ${
              verificationFilter === filter.value
                ? "bg-[#6155F5] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {errorMsg && <div className="mt-4 text-sm text-red-600">{errorMsg}</div>}

      <div className="mt-6 hidden md:block rounded-xl border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 text-gray-500">
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Verified</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : (
              displayUsers.map((u) => (
                <tr
                  key={u.id}
                  className={`border-t border-gray-200 hover:bg-gray-50 ${u.active ? "" : "opacity-60"}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>
                  <td className="px-4 py-3">
                    <RolePill role={u.role} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill active={u.active} />
                  </td>
                  <td className="px-4 py-3">
                    <VerifiedPill verified={u.verified} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.joined}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      {u.active && !u.verified && (
                        <button
                          onClick={() => handleVerify(u)}
                          className="inline-flex items-center gap-1 text-xs text-[#6155F5] transition hover:text-[#4f45d4]"
                        >
                          <BadgeCheck size={16} />
                          Verify
                        </button>
                      )}

                      {u.protected ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <Shield size={16} /> Protected
                        </span>
                      ) : !u.active ? (
                        <button
                          onClick={() => handleActivate(u)}
                          className="inline-flex items-center gap-1 text-xs text-green-600 transition hover:text-green-700"
                        >
                          <UserCheck size={16} />
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(u)}
                          className="inline-flex items-center gap-1 text-xs text-red-500 transition hover:text-red-600"
                          aria-label="Deactivate user"
                        >
                          <UserX size={16} />
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && displayUsers.length === 0 && (
          <div className="py-8 text-center text-gray-500">No users found.</div>
        )}
      </div>

      <div className="mt-6 md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : displayUsers.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No users found.</div>
        ) : (
          displayUsers.map((u) => (
            <div
              key={u.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {u.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">{u.email}</p>
                </div>

                <div className="shrink-0">
                  <div className="flex items-center gap-3">
                    {u.active && !u.verified && (
                      <button
                        onClick={() => handleVerify(u)}
                        className="text-[#6155F5] transition hover:text-[#4f45d4]"
                        aria-label="Verify user"
                      >
                        <BadgeCheck size={18} />
                      </button>
                    )}

                    {u.protected ? (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <Shield size={16} /> Protected
                      </span>
                    ) : !u.active ? (
                      <button
                        onClick={() => handleActivate(u)}
                        className="inline-flex items-center gap-1 text-xs text-green-600 transition hover:text-green-700"
                      >
                        <UserCheck size={18} />
                        Activate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDelete(u)}
                        className="text-gray-400 hover:text-red-500 transition"
                        aria-label="Deactivate user"
                      >
                        <UserX size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RolePill role={u.role} />
                  <StatusPill active={u.active} />
                  <VerifiedPill verified={u.verified} />
                </div>
                <span className="text-xs text-gray-500">
                  Joined: {u.joined}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {page} of {totalPages} * Total: {total}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="h-9 px-3 rounded-md border border-gray-300 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="h-9 px-3 rounded-md border border-gray-300 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function RolePill({ role }: { role: string }) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border";

  if (role === "super_admin") {
    return (
      <span className={`${base} bg-blue-50 text-blue-700 border-blue-100`}>
        University Admin
      </span>
    );
  }

  if (role === "admin") {
    return (
      <span className={`${base} bg-purple-50 text-purple-700 border-purple-100`}>
        Admin
      </span>
    );
  }

  return (
    <span className={`${base} bg-blue-50 text-blue-700 border-blue-100`}>
      {role}
    </span>
  );
}

function StatusPill({ active }: { active: boolean }) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border";

  return active ? (
    <span className={`${base} bg-green-50 text-green-700 border-green-100`}>
      Active
    </span>
  ) : (
    <span className={`${base} bg-gray-100 text-gray-600 border-gray-200`}>
      Deactivated
    </span>
  );
}

function VerifiedPill({ verified }: { verified: boolean }) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border";

  return verified ? (
    <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-100`}>
      Verified
    </span>
  ) : (
    <span className={`${base} bg-amber-50 text-amber-700 border-amber-100`}>
      Pending
    </span>
  );
}
