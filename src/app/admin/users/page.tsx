"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  emailVerified?: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  avgOrderValue?: number;
  lastOrder: string | null;
  addresses?: { type: string; line1: string; city: string; state: string; postalCode: string; country: string; isDefault: boolean }[];
}

interface Order {
  _id: string;
  items: { title: string; quantity: number; price: number }[];
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentProvider: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const roleColors: Record<string, string> = {
  admin: "bg-red-50 text-red-700 border-red-200",
  manager: "bg-purple-50 text-purple-700 border-purple-200",
  support: "bg-blue-50 text-blue-700 border-blue-200",
  customer: "bg-gray-100 text-gray-600 border-gray-200",
};

const rolePermissions: Record<string, string> = {
  admin: "Full access to all features",
  manager: "Manage products and orders",
  support: "View orders and help customers",
  customer: "Browse, purchase, and track orders",
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = (session?.user as any)?.role === "admin";

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/admin");
    }
  }, [status, isAdmin, router]);

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState("-createdAt");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState<{ user: User; orders: Order[] } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "customer", phone: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "" });
  const [selectedRole, setSelectedRole] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", sort });
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      }
    } catch {}
    setLoading(false);
  }, [search, roleFilter, sort]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const flash = (msg: string, isErr = false) => {
    if (isErr) setErrorMsg(msg); else setSuccessMsg(msg);
    setTimeout(() => { setSuccessMsg(""); setErrorMsg(""); }, 3000);
  };

  const toggleSort = (field: string) => {
    setSort(sort === field ? `-${field}` : field);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === users.length) { setSelected(new Set()); } else { setSelected(new Set(users.map((u) => u._id))); }
  };

  const handleAdd = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok) {
        flash("User created successfully");
        setShowAddModal(false);
        setAddForm({ name: "", email: "", password: "", role: "customer", phone: "" });
        fetchUsers(pagination.page);
      } else {
        flash(data.error || "Failed to create user", true);
      }
    } catch { flash("Failed to create user", true); }
    setActionLoading(false);
  };

  const handleEdit = async () => {
    if (!showEditModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${showEditModal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        flash("User updated successfully");
        setShowEditModal(null);
        fetchUsers(pagination.page);
      } else {
        flash(data.error || "Failed to update user", true);
      }
    } catch { flash("Failed to update user", true); }
    setActionLoading(false);
  };

  const handleRoleChange = async () => {
    if (!showRoleModal || !selectedRole) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${showRoleModal._id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (res.ok) {
        flash(`${showRoleModal.name} is now ${selectedRole}`);
        setShowRoleModal(null);
        fetchUsers(pagination.page);
      }
    } catch { flash("Failed to change role", true); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${showDeleteModal._id}`, { method: "DELETE" });
      if (res.ok) {
        flash("User deleted");
        setShowDeleteModal(null);
        fetchUsers(pagination.page);
      } else {
        const data = await res.json();
        flash(data.error || "Failed to delete user", true);
      }
    } catch { flash("Failed to delete user", true); }
    setActionLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!showPasswordModal || !newPassword) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${showPasswordModal._id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        flash(`Password reset for ${showPasswordModal.name}`);
        setShowPasswordModal(null);
        setNewPassword("");
      } else {
        const data = await res.json();
        flash(data.error || "Failed to reset password", true);
      }
    } catch { flash("Failed to reset password", true); }
    setActionLoading(false);
  };

  const handleBulkRole = async (role: string) => {
    if (selected.size === 0) return;
    setActionLoading(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/admin/users/${id}/role`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role }),
          })
        )
      );
      flash(`${selected.size} users updated to ${role}`);
      setSelected(new Set());
      fetchUsers(pagination.page);
    } catch { flash("Bulk update failed", true); }
    setActionLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0 || !confirm(`Delete ${selected.size} users?`)) return;
    setActionLoading(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) => fetch(`/api/admin/users/${id}`, { method: "DELETE" }))
      );
      flash(`${selected.size} users deleted`);
      setSelected(new Set());
      fetchUsers(pagination.page);
    } catch { flash("Bulk delete failed", true); }
    setActionLoading(false);
  };

  const handleExport = () => {
    const headers = ["Name", "Email", "Role", "Phone", "Verified", "Orders", "Total Spent", "Joined"];
    const rows = users.map((u) => [
      u.name, u.email, u.role, u.phone || "", u.emailVerified ? "Yes" : "No",
      String(u.orderCount), `$${(u.totalSpent / 100).toFixed(2)}`, new Date(u.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const openViewModal = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setShowViewModal({ user: data.user, orders: data.orders });
      }
    } catch {}
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sort === field) return <span className="ml-1 text-gray-900">&#9650;</span>;
    if (sort === `-${field}`) return <span className="ml-1 text-gray-900">&#9660;</span>;
    return <span className="ml-1 text-gray-300">&#9650;&#9660;</span>;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-400 mt-1">{pagination.total} total users</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <>
              <span className="text-sm text-gray-500">{selected.size} selected</span>
              {isAdmin && (
                <div className="relative group">
                  <button className="px-3 py-2 bg-purple-50 text-purple-700 text-sm rounded-lg hover:bg-purple-100">Change Role</button>
                  <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-10">
                    {["customer", "support", "manager", "admin"].map((r) => (
                      <button key={r} onClick={() => handleBulkRole(r)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 capitalize first:rounded-t-xl last:rounded-b-xl">{r}</button>
                    ))}
                  </div>
                </div>
              )}
              {isAdmin && (
                <button onClick={handleBulkDelete} className="px-3 py-2 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100">Delete</button>
              )}
            </>
          )}
          <button onClick={handleExport} className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">Export CSV</button>
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">+ Add User</button>
          )}
        </div>
      </div>

      {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">{successMsg}</div>}
      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{errorMsg}</div>}

      <div className="flex items-center gap-3 mb-4">
        <input type="text" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        <div className="flex gap-1">
          {["all", "admin", "manager", "support", "customer"].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${roleFilter === r ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>{r}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-10 px-4 py-3"><input type="checkbox" checked={selected.size === users.length && users.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300" /></th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort("name")}>User <SortIcon field="name" /></th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort("role")}>Role <SortIcon field="role" /></th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort("-orderCount")}>Orders <SortIcon field="-orderCount" /></th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort("-totalSpent")}>Spent <SortIcon field="-totalSpent" /></th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort("-createdAt")}>Joined <SortIcon field="-createdAt" /></th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user._id} className={`hover:bg-gray-50 ${selected.has(user._id) ? "bg-blue-50/50" : ""}`}>
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.has(user._id)} onChange={() => toggleSelect(user._id)} className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{user.name?.charAt(0)?.toUpperCase() || "?"}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded border capitalize ${roleColors[user.role] || ""}`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{user.orderCount}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">${(user.totalSpent / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openViewModal(user)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button onClick={() => { setShowEditModal(user); setEditForm({ name: user.name, email: user.email, phone: user.phone || "", role: user.role }); }} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      {isAdmin && (
                        <button onClick={() => { setShowRoleModal(user); setSelectedRole(user.role); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Change Role">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => { setShowPasswordModal(user); setNewPassword(""); }} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Reset Password">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => setShowDeleteModal(user)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="p-12 text-center text-sm text-gray-400">No users found</div>}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.pages} ({pagination.total} users)</p>
              <div className="flex gap-1">
                <button onClick={() => fetchUsers(pagination.page - 1)} disabled={pagination.page <= 1}
                  className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40">Prev</button>
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  const start = Math.max(1, pagination.page - 2);
                  const p = start + i;
                  if (p > pagination.pages) return null;
  if (status === "loading") {
    return (
      <div className="p-6 lg:p-8 flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 lg:p-8 text-center py-20">
        <p className="text-gray-400">Access denied. Admins only.</p>
      </div>
    );
  }

  return (
                    <button key={p} onClick={() => fetchUsers(p)}
                      className={`px-3 py-1.5 text-xs rounded-lg ${pagination.page === p ? "bg-gray-900 text-white" : "text-gray-600 bg-gray-100 hover:bg-gray-200"}`}>{p}</button>
                  );
                })}
                <button onClick={() => fetchUsers(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <Modal title="Add User" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <Field label="Name" value={addForm.name} onChange={(v) => setAddForm({ ...addForm, name: v })} />
            <Field label="Email" type="email" value={addForm.email} onChange={(v) => setAddForm({ ...addForm, email: v })} />
            <Field label="Password" type="password" value={addForm.password} onChange={(v) => setAddForm({ ...addForm, password: v })} />
            <Field label="Phone (optional)" value={addForm.phone} onChange={(v) => setAddForm({ ...addForm, phone: v })} />
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Role</label>
              <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10">
                <option value="customer">Customer</option>
                <option value="support">Support</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <ModalActions onClose={() => setShowAddModal(false)} onConfirm={handleAdd} loading={actionLoading} confirmText="Create User" />
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Edit User" onClose={() => setShowEditModal(null)}>
          <div className="space-y-4">
            <Field label="Name" value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} />
            <Field label="Email" type="email" value={editForm.email} onChange={(v) => setEditForm({ ...editForm, email: v })} />
            <Field label="Phone" value={editForm.phone} onChange={(v) => setEditForm({ ...editForm, phone: v })} />
            {isAdmin && (
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10">
                  <option value="customer">Customer</option>
                  <option value="support">Support</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
          </div>
          <ModalActions onClose={() => setShowEditModal(null)} onConfirm={handleEdit} loading={actionLoading} confirmText="Save Changes" />
        </Modal>
      )}

      {showRoleModal && (
        <Modal title="Change Role" onClose={() => setShowRoleModal(null)}>
          <p className="text-sm text-gray-500 mb-4">Assign a new role to <strong>{showRoleModal.name}</strong></p>
          <div className="space-y-2 mb-6">
            {(["customer", "support", "manager", "admin"] as const).map((role) => (
              <label key={role} className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedRole === role ? "border-gray-900 bg-gray-50" : "border-gray-100 hover:border-gray-200"}`}>
                <input type="radio" name="role" checked={selectedRole === role} onChange={() => setSelectedRole(role)} className="sr-only" />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${selectedRole === role ? "border-gray-900" : "border-gray-300"}`}>
                  {selectedRole === role && <div className="w-2 h-2 bg-gray-900 rounded-full" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{role}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{rolePermissions[role]}</p>
                </div>
              </label>
            ))}
          </div>
          <ModalActions onClose={() => setShowRoleModal(null)} onConfirm={handleRoleChange} loading={actionLoading} confirmText="Confirm" />
        </Modal>
      )}

      {showDeleteModal && (
        <Modal title="Delete User" onClose={() => setShowDeleteModal(null)}>
          <div className="mb-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <p className="text-sm text-gray-600 text-center">Are you sure you want to delete <strong>{showDeleteModal.name}</strong>? This action cannot be undone.</p>
          </div>
          <ModalActions onClose={() => setShowDeleteModal(null)} onConfirm={handleDelete} loading={actionLoading} confirmText="Delete User" danger />
        </Modal>
      )}

      {showPasswordModal && (
        <Modal title="Reset Password" onClose={() => setShowPasswordModal(null)}>
          <div className="mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">Set a new password for <strong>{showPasswordModal.name}</strong></p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
              minLength={6}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
          <ModalActions onClose={() => setShowPasswordModal(null)} onConfirm={handlePasswordReset} loading={actionLoading} confirmText="Reset Password" />
        </Modal>
      )}

      {showViewModal && (
        <Modal title="User Details" onClose={() => setShowViewModal(null)} wide>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl font-bold">{showViewModal.user.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <h3 className="font-bold text-gray-900">{showViewModal.user.name}</h3>
                <p className="text-sm text-gray-400">{showViewModal.user.email}</p>
                <span className={`inline-block mt-2 text-[11px] font-medium px-2 py-0.5 rounded border capitalize ${roleColors[showViewModal.user.role]}`}>{showViewModal.user.role}</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Phone</span><span className="text-gray-700">{showViewModal.user.phone || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Email Verified</span><span className="text-gray-700">{showViewModal.user.emailVerified ? "Yes" : "No"}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Joined</span><span className="text-gray-700">{new Date(showViewModal.user.createdAt).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Orders</span><span className="text-gray-700">{showViewModal.user.orderCount}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Total Spent</span><span className="text-gray-900 font-medium">${(showViewModal.user.totalSpent / 100).toFixed(2)}</span></div>
                {showViewModal.user.avgOrderValue && showViewModal.user.avgOrderValue > 0 && (
                  <div className="flex justify-between"><span className="text-gray-400">Avg Order</span><span className="text-gray-700">${(showViewModal.user.avgOrderValue / 100).toFixed(2)}</span></div>
                )}
              </div>

              {showViewModal.user.addresses && showViewModal.user.addresses.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Addresses</h4>
                  {showViewModal.user.addresses.map((addr, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 mb-2">
                      <span className="font-medium text-gray-900 capitalize">{addr.type}</span>
                      <p className="mt-1">{addr.line1}</p>
                      <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p>{addr.country}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Recent Orders</h4>
              {showViewModal.orders.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No orders yet</p>
              ) : (
                <div className="space-y-2">
                  {showViewModal.orders.map((order) => (
                    <div key={order._id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{order.paymentStatus}</span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${order.fulfillmentStatus === "delivered" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>{order.fulfillmentStatus}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">{order.items.map((i) => `${i.title} x${i.quantity}`).join(", ")}</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">${(order.total / 100).toFixed(2)} via {order.paymentProvider}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-6"><button onClick={() => setShowViewModal(null)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button></div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`bg-white rounded-xl w-full ${wide ? "max-w-3xl" : "max-w-md"} p-6 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
    </div>
  );
}

function ModalActions({ onClose, onConfirm, loading, confirmText, danger }: { onClose: () => void; onConfirm: () => void; loading: boolean; confirmText: string; danger?: boolean }) {
  return (
    <div className="flex gap-2 mt-6">
      <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
      <button onClick={onConfirm} disabled={loading}
        className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800"}`}>
        {loading ? "Saving..." : confirmText}
      </button>
    </div>
  );
}
