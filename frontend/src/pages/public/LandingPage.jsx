import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Package,
  Wrench,
  FileCheck2,
  BellRing,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      title: 'Complete Product Inventory',
      desc: 'Catalog devices, electronics, and enterprise assets with brands, serial numbers, purchase dates, and receipt proofs.',
      icon: Package,
      tag: 'Core CRUD',
    },
    {
      title: 'Live Expiration Tracking',
      desc: 'Dynamic real-time calculations for Active, Expiring Soon (<30 days), and Expired statuses with countdown counters.',
      icon: Clock,
      tag: 'Automated',
    },
    {
      title: 'Maintenance & Service Records',
      desc: 'Log repair history, service centers, maintenance costs, and diagnostic notes attached directly to your hardware assets.',
      icon: Wrench,
      tag: 'Service Log',
    },
    {
      title: 'Cloud Document Vault',
      desc: 'Store original purchase receipts and official warranty cards in private cloud storage with secure time-limited access.',
      icon: FileCheck2,
      tag: 'Storage',
    },
    {
      title: 'Instant Query & Filtering',
      desc: 'Multi-criteria debounced search across product models, serials, and categories with multi-parameter database sorting.',
      icon: Search,
      tag: 'Search',
    },
    {
      title: 'Automated Email Reminders',
      desc: 'Direct email alert dispatch via Nodemailer alerting owners before warranty periods elapse to prevent coverage loss.',
      icon: BellRing,
      tag: 'Notifications',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col antialiased selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-500 text-white flex items-center justify-center shadow-sm shadow-brand-500/20 group-hover:scale-[1.02] transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight">
                WarrantyFlow
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Asset & Warranty Suite
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-sm transition-all hover:shadow-md"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-sm transition-all hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50/90 border border-brand-200/80 text-brand-700 text-xs font-bold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            <span>Next-Generation Asset & Warranty Lifecycle Management</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Total control over your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800">
              hardware warranties
            </span>{' '}
            and repair history
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Eliminate expired warranty surprises, misplaced receipts, and untracked service costs with automated timeline monitoring and cloud document vaults.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-xs"
            >
              Access Existing Workspace
            </Link>
          </div>
        </div>

        {/* Live UI Mockup Card */}
        <div className="mt-6 bg-white rounded-3xl border border-slate-200/90 shadow-elevated p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono text-slate-400 ml-2">warrantyflow.internal/workspace</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Real-Time Engine</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">MacBook Pro 16"</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active &bull; 240d
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800">AppleCare+ Enterprise</p>
              <p className="text-xs text-slate-500 mt-1">Receipt & Policy card attached</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Sony Headphones</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  Expiring &bull; 14d
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800">Standard Manufacturer</p>
              <p className="text-xs text-amber-700 mt-1">Email notification dispatched</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logitech MX Master</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Expired
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800">Out of Coverage</p>
              <p className="text-xs text-slate-500 mt-1">1 Service record on file</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for absolute clarity and reliability
            </h2>
            <p className="mt-3 text-slate-500 text-sm sm:text-base">
              A balanced architecture separating product inventory, warranty computation, and service documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-7 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300/90 transition-all shadow-card hover:shadow-card-hover group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6 stroke-[1.75]" />
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                        {feat.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-10 border-t border-slate-900 text-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">WarrantyFlow Enterprise</p>
              <p className="text-slate-500 text-[11px]">Asset, Warranty, and Maintenance Management</p>
            </div>
          </div>
          <div className="flex items-center gap-6 font-semibold text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <span className="text-slate-700">&bull;</span>
            <span className="text-slate-500 font-mono text-[11px]">PostgreSQL & Supabase Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
