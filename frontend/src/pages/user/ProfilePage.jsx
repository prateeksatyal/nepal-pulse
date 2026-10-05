import React, { useState } from 'react';
import { User, Lock, Mail, Shield, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { formatDate } from '../../utils/dateUtils';

export default function ProfilePage() {
  const { user, updateProfileData } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (newPassword) {
      if (newPassword.length < 6) {
        setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
        return;
      }
      if (!currentPassword) {
        setStatusMessage({ type: 'error', text: 'Current password is required to set a new password.' });
        return;
      }
    }

    setLoading(true);
    try {
      const payload = { name };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await axiosClient.put('/auth/profile', payload);
      if (res.data.success) {
        updateProfileData({ name });
        setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details and security credentials.
        </p>
      </div>

      {statusMessage.text && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl border border-brand-100">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                Role: {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
              </span>
              <span className="text-[11px] text-slate-400">
                Joined: {formatDate(user?.created_at)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 text-sm border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Email address cannot be changed.</p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Change Password (Leave blank to keep current)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required if setting new password"
                className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
