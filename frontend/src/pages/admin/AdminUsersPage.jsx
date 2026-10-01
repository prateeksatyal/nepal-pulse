import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, Trash2, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const res = await axiosClient.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (targetUser.id === currentAdmin.id && newRole === 'user') {
      alert('You cannot demote your own active administrator account.');
      return;
    }
    if (!window.confirm(`Change role of ${targetUser.name} to "${newRole}"?`)) return;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Account Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review registered accounts, role-based authorization levels, and user asset counts.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading users..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Owned Assets</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = u.id === currentAdmin.id;
                  const isAdmin = u.role === 'admin';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.2 rounded font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isAdmin
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isAdmin ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          <span className="capitalize">{u.role}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-700">
                        {u.product_count || 0} product(s)
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDate(u.created_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRoleToggle(u)}
                            disabled={isCurrent}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Toggle role between user and admin"
                          >
                            {isAdmin ? 'Demote to User' : 'Promote to Admin'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(u)}
                            disabled={isCurrent}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
        message={`Are you sure you want to permanently delete user "${userToDelete?.name}" (${userToDelete?.email})? All products and warranties owned by this user will be removed.`}
        confirmText="Yes, Delete User"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
