import React, { useState } from 'react';
import {
  User,
  Lock,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  ShieldCheck,
  Calendar,
  Cloud,
  Check,
} from 'lucide-react';
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
        setStatusMessage({ type: 'success', text: 'Profile details updated successfully!' });
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

  const isAdmin = user?.role === 'admin';

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DEDA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA]">
              <User className="w-3.5 h-3.5 text-[#0F6B68]" />
              Account Settings
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101827] tracking-tight mt-1.5">
            Account Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-3xl">
            Manage your personal profile details and password.
          </p>
        </div>
      </div>

      {statusMessage.text && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-medium flex items-center gap-2.5 ${
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

      {/* Balanced 2-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Account Identity & Security Overview (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity Card */}
          <div className="bg-white rounded-lg border border-[#D9DEDA] p-6 text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full bg-[#0F6B68] text-white flex items-center justify-center font-bold text-xl mx-auto">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#15803D] border-2 border-white flex items-center justify-center text-white text-[10px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-[#101827]">{user?.name}</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">{user?.email}</p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F1F3F1] text-xs font-semibold text-[#111827] border border-[#D9DEDA]">
              <Shield className="w-3.5 h-3.5 text-[#0F6B68]" />
              <span>{isAdmin ? 'System Administrator' : 'Standard User'}</span>
            </div>

            <div className="pt-3 border-t border-[#D9DEDA] flex items-center justify-center gap-1.5 text-xs text-[#6B7280]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member since {formatDate(user?.created_at)}</span>
            </div>
          </div>

          {/* Account Capabilities & Health */}
          <div className="bg-white rounded-lg border border-[#D9DEDA] p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] pb-2 border-b border-[#D9DEDA] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0F6B68]" />
              Account Status
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-[#4B5563]">Authentication</span>
                <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold bg-[#EAF6EC] px-2 py-0.5 rounded border border-[#15803D]/20">
                  <Check className="w-3 h-3" /> Active
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#4B5563]">Storage Vault</span>
                <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold bg-[#EAF6EC] px-2 py-0.5 rounded border border-[#15803D]/20">
                  <Check className="w-3 h-3" /> Connected
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#4B5563]">Expiry Notifications</span>
                <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold bg-[#EAF6EC] px-2 py-0.5 rounded border border-[#15803D]/20">
                  <Check className="w-3 h-3" /> Enabled
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#4B5563]">Account Role</span>
                <span className="font-semibold text-[#101827]">
                  {isAdmin ? 'System Administrator' : 'Standard User'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile & Security Edit Form (8 cols) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details Card */}
            <div className="bg-white rounded-lg border border-[#D9DEDA] p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#D9DEDA]">
                <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#101827] uppercase tracking-wider">
                    Basic Profile Information
                  </h2>
                  <p className="text-xs text-[#6B7280]">Update your display name</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7280]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white text-xs border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] text-[#111827] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7280]">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-8 pr-3 py-2 bg-[#F1F3F1] text-xs border border-[#D9DEDA] rounded-md text-[#6B7280] cursor-not-allowed font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-[#6B7280] mt-1.5">
                    For security compliance, your email address is bound to your account and cannot be modified.
                  </p>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-lg border border-[#D9DEDA] p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#D9DEDA]">
                <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center font-bold text-xs">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#101827] uppercase tracking-wider">
                    Change Password
                  </h2>
                  <p className="text-xs text-[#6B7280]">Leave blank if you do not wish to change your password</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7280]">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password to authorize changes"
                      className="w-full pl-8 pr-3 py-2 bg-white text-xs border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] text-[#111827]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7280]">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-8 pr-3 py-2 bg-white text-xs border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] text-[#111827]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7280]">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-8 pr-3 py-2 bg-white text-xs border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] text-[#111827]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0F6B68] hover:bg-[#0B5754] rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
