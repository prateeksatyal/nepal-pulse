import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col justify-center antialiased selection:bg-[#0F6B68] selection:text-white p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl lg:max-w-6xl mx-auto">
        <div className="bg-white rounded-lg border border-[#D9DEDA] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* Left Dark Panel: #101827 */}
          <div className="lg:col-span-5 bg-[#101827] text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              <Link to="/" className="inline-flex items-center gap-2.5 mb-8 lg:mb-10">
                <div className="w-8 h-8 rounded-md bg-[#0F6B68] text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-white tracking-tight text-lg leading-tight">
                    WarrantyFlow
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Warranty Management
                  </span>
                </div>
              </Link>

              <div className="space-y-3">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-[#0F6B68] bg-[#172235] px-2.5 py-0.5 rounded">
                  Create Account
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                  Keep track of all your equipment warranties.
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Catalog equipment, store purchase receipts, and set up automated expiration reminders.
                </p>
              </div>

              <div className="mt-8 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded bg-[#0F6B68]/30 text-[#0F6B68] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span>Equipment and product inventory</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded bg-[#0F6B68]/30 text-[#0F6B68] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span>Purchase invoice and receipt storage</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded bg-[#0F6B68]/30 text-[#0F6B68] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span>Automated 30-day warranty countdowns</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#172235] text-[11px] text-slate-500 flex items-center justify-between">
              <span>WarrantyFlow</span>
              <span>Account Setup</span>
            </div>
          </div>

          {/* Right Form Panel: #FFFFFF */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#101827] tracking-tight">
                  Create Account
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Register in seconds to establish your personal workspace.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-[#FDECEC] border border-[#B42318]/30 rounded-md flex items-center gap-2 text-xs text-[#B42318]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#101827] mb-1">
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
                      placeholder="Alex Johnson"
                      className="w-full pl-9 pr-3.5 py-2 bg-white text-xs sm:text-sm text-[#111827] border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#101827] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-9 pr-3.5 py-2 bg-white text-xs sm:text-sm text-[#111827] border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#101827] mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-9 pr-3.5 py-2 bg-white text-xs sm:text-sm text-[#111827] border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#101827] mb-1">
                      Confirm
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full pl-9 pr-3.5 py-2 bg-white text-xs sm:text-sm text-[#111827] border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-md text-white bg-[#0F6B68] hover:bg-[#0B5754] focus:outline-none focus:ring-2 focus:ring-[#0F6B68]/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2 shadow-xs"
                >
                  {loading ? (
                    'Creating Account...'
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#D9DEDA] text-center">
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <Link to="/login" className="font-semibold text-[#0F6B68] hover:underline">
                    Sign in to account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
