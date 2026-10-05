import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col justify-center antialiased selection:bg-[#0F6B68] selection:text-white p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-white rounded-lg border border-[#D9DEDA] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* Left Dark Panel: #101827 */}
          <div className="lg:col-span-5 bg-[#101827] text-white p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
                <div className="w-8 h-8 rounded-md bg-[#0F6B68] text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-white tracking-tight text-lg leading-tight">
                    WarrantyFlow
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Warranty & Asset Suite
                  </span>
                </div>
              </Link>

              <div className="space-y-3">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-[#0F6B68] bg-[#172235] px-2.5 py-0.5 rounded">
                  Secure Workspace Access
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                  Manage hardware warranties with absolute certainty.
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Real-time timeline calculations, private document storage, and maintenance logs in a single system.
                </p>
              </div>

              {/* Functional Highlights */}
              <div className="mt-8 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded bg-[#0F6B68]/30 text-[#0F6B68] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span>Automated 30-day expiration notifications</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded bg-[#0F6B68]/30 text-[#0F6B68] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span>Private encrypted object storage for invoices</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded bg-[#0F6B68]/30 text-[#0F6B68] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span>Comprehensive technician repair logs & cost audits</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#172235] text-[11px] text-slate-500 flex items-center justify-between">
              <span>PostgreSQL & JWT Protected</span>
              <span>Encrypted Session</span>
            </div>
          </div>

          {/* Right Form Panel: #FFFFFF */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#101827] tracking-tight">
                  Sign In
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter your credentials to access your warranty workspace.
                </p>
              </div>

              {isExpired && (
                <div className="mb-4 p-3 bg-[#FFF5DA] border border-[#B7791F]/30 rounded-md flex items-center gap-2 text-xs text-[#B7791F]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Your session has expired. Please sign in again to continue.</span>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-[#FDECEC] border border-[#B42318]/30 rounded-md flex items-center gap-2 text-xs text-[#B42318]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#101827] mb-1.5">
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#101827] mb-1.5">
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
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2 bg-white text-xs sm:text-sm text-[#111827] border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-md text-white bg-[#0F6B68] hover:bg-[#0B5754] focus:outline-none focus:ring-2 focus:ring-[#0F6B68]/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2 shadow-xs"
                >
                  {loading ? (
                    'Signing In...'
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#D9DEDA] text-center">
                <p className="text-xs text-slate-500">
                  Don't have an account yet?{' '}
                  <Link to="/register" className="font-semibold text-[#0F6B68] hover:underline">
                    Create account
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
