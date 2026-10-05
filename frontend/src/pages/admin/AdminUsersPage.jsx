import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  Trash2,
  AlertCircle,
  Search,
  UserPlus,
  ShieldAlert,
  ArrowUpDown,
  Package,
  Calendar,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/forms/SearchBar';
import { formatDate } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosClient.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.response?.data?.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const roleTitle = newRole === 'admin' ? 'Administrator' : 'Standard User';
    if (targetUser.id === currentAdmin.id && newRole === 'user') {
      alert('You cannot demote your own active administrator account.');
      return;
    }
    if (!window.confirm(`Change role of ${targetUser.name} to "${roleTitle}"?`)) return;

    try {
      await axiosClient.put(`/admin/users/${targetUser.id}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteClick = (u) => {
    if (u.id === currentAdmin.id) {
      alert('You cannot delete your own active administrator account.');
      return;
    }
    setUserToDelete(u);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/admin/users/${userToDelete.id}`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = !roleFilter || u.role === roleFilter;
      const matchesSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, search]);

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;
  const totalAssets = users.reduce((acc, u) => acc + (parseInt(u.product_count, 10) || 0), 0);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              Role-Based Access Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            User Account Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Audit registered identities, promote or demote administrator privileges, and oversee multi-user asset holdings.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-sm text-rose-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Accounts
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{users.length}</span>
            <span className="text-xs font-semibold text-slate-500">Registered</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Standard Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{userCount}</span>
            <span className="text-xs font-semibold text-slate-500">Active</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Administrators
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{adminCount}</span>
            <span className="text-xs font-semibold text-purple-700">Root Access</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assets Managed
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{totalAssets}</span>
            <span className="text-xs font-semibold text-brand-600">Total Products</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder="Search by user name or email address..."
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-44 px-3.5 py-2 bg-white text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-700"
          >
            <option value="">All Roles ({users.length})</option>
            <option value="user">Standard User ({userCount})</option>
            <option value="admin">Administrator ({adminCount})</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading user directory..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description={search || roleFilter ? "No user accounts match your search filters." : "There are currently no registered user accounts."}
          icon={Users}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">User Identity</th>
                  <th className="py-3.5 px-4">Authorization Role</th>
                  <th className="py-3.5 px-4 text-center">Owned Assets</th>
                  <th className="py-3.5 px-4">Registration Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === currentAdmin.id;
                  const isAdmin = u.role === 'admin';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                            isAdmin
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-brand-50 text-brand-700 border border-brand-200/60 px-2 py-0.5 rounded-full font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 block">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isAdmin
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          <span>{isAdmin ? 'Administrator' : 'Standard User'}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          <Package className="w-3 h-3 text-slate-500" />
                          <span>{u.product_count || 0}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(u.created_at)}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRoleToggle(u)}
                            disabled={isCurrent}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                              isAdmin
                                ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                : 'border-purple-200 text-purple-700 bg-purple-50/50 hover:bg-purple-100'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title="Toggle role between Standard User and Administrator"
                          >
                            {isAdmin ? 'Demote to User' : 'Promote to Admin'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(u)}
                            disabled={isCurrent}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${userToDelete?.name}" (${userToDelete?.email})? All products and warranties owned by this user will be removed from the database.`}
        confirmText="Yes, Delete User"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
