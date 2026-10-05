import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center antialiased selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-10">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-elevated overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          {/* Left Hero / Brand Showcase (Desktop 6 cols) */}
          <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 p-8 sm:p-12 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background subtle glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            <div>
              <Link to="/" className="inline-flex items-center gap-3 group mb-10">
                <div className="w-11 h-11 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-white tracking-tight text-xl leading-tight">
                    WarrantyFlow
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    Enterprise Edition
                  </span>
                </div>
              </Link>

              <div className="space-y-4 max-w-md">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-semibold backdrop-blur-sm border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  Asset & Protection Suite
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Single system for all your hardware warranties
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Real-time expiry computation, private document storage, and maintenance tracking.
                </p>
              </div>

              {/* Showcase preview cards */}
              <div className="mt-8 space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Automated Expiry Calculation</p>
                    <p className="text-[11px] text-slate-400">Instant countdowns and status indicators</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Private Supabase Storage</p>
                    <p className="text-[11px] text-slate-400">Encrypted receipts & warranty cards vault</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10 text-[11px] text-slate-500 flex items-center justify-between">
              <span>PostgreSQL & JWT Protected</span>
              <span>Encrypted Session</span>
            </div>
          </div>

          {/* Right Form Column (Desktop 6 cols) */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Sign In
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                  Enter your credentials to access your warranty workspace.
                </p>
              </div>

              {/* Session Expired Notice */}
              {isExpired && (
                <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center gap-2.5 text-xs font-medium text-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>Your session has expired. Please sign in again to continue.</span>
                </div>
              )}

              {/* Error Notice */}
              {error && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-center gap-2.5 text-xs font-medium text-rose-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 text-xs sm:text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    'Authenticating...'
                  ) : (
                    <>
                      <span>Sign In to Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2">
                    Create free account
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
