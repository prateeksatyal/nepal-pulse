import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Package,
  Wrench,
  FileCheck,
  BellRing,
  Search,
  ArrowRight,
  Clock,
  Check,
  Shield,
  Layers,
  ChevronRight,
  Database,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';

export default function LandingPage() {
  const { user } = useAuth();

  const capabilities = [
    {
      title: 'Centralized Asset Inventory',
      desc: 'Catalog hardware assets with model identifiers, serial numbers, categories, purchase dates, and vendor details in one unified repository.',
      icon: Package,
    },
    {
      title: 'Automated Warranty Tracking',
      desc: 'Real-time term calculation tracking active, expiring soon (under 30 days), and expired warranty policies automatically.',
      icon: Clock,
    },
    {
      title: 'Maintenance & Service Logs',
      desc: 'Record repair events, authorized service centers, parts replacement notes, and maintenance expenses per asset.',
      icon: Wrench,
    },
    {
      title: 'Private Document Vault',
      desc: 'Store original purchase invoices and warranty registration cards in private cloud object storage with secure server-side retrieval.',
      icon: FileCheck,
    },
    {
      title: 'Email Expiry Alerts',
      desc: 'Automated notification dispatch warning users in advance of expiring coverage periods to ensure timely renewals and claims.',
      icon: BellRing,
    },
    {
      title: 'Structured Multi-Criteria Search',
      desc: 'Instant query filtering across product titles, brands, models, serial numbers, and classifications.',
      icon: Search,
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Register Equipment',
      desc: 'Add products with model, serial, purchase date, price, and upload the purchase receipt.',
    },
    {
      step: '02',
      title: 'Bind Warranty Agreements',
      desc: 'Attach manufacturer coverage terms, extended warranty providers, and policy cards.',
    },
    {
      step: '03',
      title: 'Monitor & Maintain',
      desc: 'Receive automated expiry reminders, log diagnostic repairs, and audit servicing costs.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col antialiased selection:bg-[#0F6B68] selection:text-white">
      {/* Top Navigation */}
      <header className="bg-white border-b border-[#D9DEDA] sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#0F6B68] text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#101827] tracking-tight text-base leading-tight">
                WarrantyFlow
              </span>
              <span className="text-[11px] font-medium text-slate-500 leading-none">
                Warranty Management System
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F6B68] hover:bg-[#0B5754] rounded-md transition-colors"
              >
                <span>Open Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-[#111827] hover:bg-[#F1F3F1] rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F6B68] hover:bg-[#0B5754] rounded-md transition-colors"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section: Editorial Asymmetric Layout (LEFT: Copy, RIGHT: Live UI Preview) */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Eyebrow, Headline, Value, CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F1F3F1] border border-[#D9DEDA] text-slate-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F6B68]" />
              <span>Warranty & Asset Management</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#101827] tracking-tight leading-[1.15]">
              Manage your products, warranties and repair records in one place.
            </h1>

            <p className="text-base text-slate-600 leading-relaxed font-normal">
              Track coverage dates, organize purchase invoices, log repair costs, and receive automated expiration warnings before protection lapses.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/register"
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0F6B68] hover:bg-[#0B5754] rounded-md transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-[#D9DEDA] hover:bg-[#F1F3F1] rounded-md transition-colors"
              >
                Sign In to Workspace
              </Link>
            </div>

            <div className="pt-4 border-t border-[#D9DEDA] grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="font-bold text-[#101827]">Warranty Tracking</p>
                <p className="text-slate-500 text-[11px]">Active countdowns</p>
              </div>
              <div>
                <p className="font-bold text-[#101827]">Document Vault</p>
                <p className="text-slate-500 text-[11px]">Receipts & cards</p>
              </div>
              <div>
                <p className="font-bold text-[#101827]">Expiration Alerts</p>
                <p className="text-slate-500 text-[11px]">Advance reminders</p>
              </div>
            </div>
          </div>

          {/* Right Column: Actual Real UI Interface Preview */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg border border-[#D9DEDA] shadow-sm overflow-hidden">
              {/* Fake App Window Titlebar */}
              <div className="bg-[#F1F3F1] px-4 py-3 border-b border-[#D9DEDA] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-[11px] font-mono text-slate-500 ml-2">app.warrantyflow.com/dashboard</span>
                </div>
                <span className="text-[11px] font-medium text-[#15803D] bg-[#EAF6EC] px-2 py-0.5 rounded">
                  System Operational
                </span>
              </div>

              {/* Inside Dashboard View */}
              <div className="p-5 space-y-4">
                {/* 4 Mini KPI Cards */}
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="p-3 bg-[#F7F7F4] border border-[#D9DEDA] rounded-md">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Products</span>
                    <span className="text-lg font-bold text-[#101827]">14</span>
                  </div>
                  <div className="p-3 bg-[#F7F7F4] border border-[#D9DEDA] rounded-md">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Active</span>
                    <span className="text-lg font-bold text-[#15803D]">10</span>
                  </div>
                  <div className="p-3 bg-[#F7F7F4] border border-[#D9DEDA] rounded-md">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Expiring</span>
                    <span className="text-lg font-bold text-[#B7791F]">2</span>
                  </div>
                  <div className="p-3 bg-[#F7F7F4] border border-[#D9DEDA] rounded-md">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Expired</span>
                    <span className="text-lg font-bold text-[#B42318]">2</span>
                  </div>
                </div>

                {/* Table representation */}
                <div className="border border-[#D9DEDA] rounded-md overflow-hidden">
                  <div className="bg-[#F1F3F1] px-3 py-2 border-b border-[#D9DEDA] text-[11px] font-bold text-slate-600 grid grid-cols-12">
                    <span className="col-span-5">Product</span>
                    <span className="col-span-4">Provider / Plan</span>
                    <span className="col-span-3 text-right">Status</span>
                  </div>
                  <div className="divide-y divide-[#D9DEDA] text-xs">
                    <div className="px-3 py-2.5 grid grid-cols-12 items-center bg-white">
                      <div className="col-span-5">
                        <p className="font-semibold text-[#101827]">MacBook Pro 16"</p>
                        <p className="text-[10px] text-slate-400">Apple • Laptop</p>
                      </div>
                      <div className="col-span-4 text-slate-600 text-[11px]">
                        AppleCare+ (240d left)
                      </div>
                      <div className="col-span-3 text-right">
                        <StatusBadge status="active" daysRemaining={240} size="sm" />
                      </div>
                    </div>
                    <div className="px-3 py-2.5 grid grid-cols-12 items-center bg-white">
                      <div className="col-span-5">
                        <p className="font-semibold text-[#101827]">Dell UltraSharp 32"</p>
                        <p className="text-[10px] text-slate-400">Dell • Monitor</p>
                      </div>
                      <div className="col-span-4 text-slate-600 text-[11px]">
                        Dell ProSupport (18d left)
                      </div>
                      <div className="col-span-3 text-right">
                        <StatusBadge status="expiring soon" daysRemaining={18} size="sm" />
                      </div>
                    </div>
                    <div className="px-3 py-2.5 grid grid-cols-12 items-center bg-white">
                      <div className="col-span-5">
                        <p className="font-semibold text-[#101827]">Sony WH-1000XM5</p>
                        <p className="text-[10px] text-slate-400">Sony • Audio</p>
                      </div>
                      <div className="col-span-4 text-slate-600 text-[11px]">
                        Manufacturer Standard
                      </div>
                      <div className="col-span-3 text-right">
                        <StatusBadge status="expired" daysRemaining={-42} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#F1F3F1] border border-[#D9DEDA] rounded-md flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#0F6B68]" />
                    <span>Purchase invoices and warranty cards verified</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">Private Bucket</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-14 sm:py-18 bg-white border-y border-[#D9DEDA]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl font-bold text-[#101827] tracking-tight">
              Everything you need to manage product warranties
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Track equipment, coverage periods, repair history, and invoices in one structured system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-lg border border-[#D9DEDA] bg-white hover:border-slate-400 transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] flex items-center justify-center mb-3.5 border border-[#D9DEDA]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#101827] mb-1.5">{cap.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        <div className="max-w-2xl mb-10">
          <h2 className="text-2xl font-bold text-[#101827] tracking-tight">
            How WarrantyFlow works
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            A three-step lifecycle model from initial purchase to retirement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workflowSteps.map((s, idx) => (
            <div key={idx} className="p-6 rounded-lg border border-[#D9DEDA] bg-white">
              <span className="text-xs font-mono font-bold text-[#0F6B68] block mb-2">{s.step}</span>
              <h3 className="text-sm font-bold text-[#101827] mb-1.5">{s.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 bg-[#101827] text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Ready to organize your equipment warranties?</h3>
            <p className="text-xs text-slate-400 mt-1">
              Start tracking hardware agreements, invoices, and maintenance logs today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F6B68] hover:bg-[#0B5754] rounded-md transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#172235] hover:bg-[#233045] rounded-md transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#D9DEDA] py-6 text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F6B68]" />
            <span className="font-semibold text-[#101827]">WarrantyFlow</span>
            <span>&mdash; Warranty & Asset Management System</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/login" className="hover:text-[#101827] transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-[#101827] transition-colors">Register</Link>
            <span>&bull;</span>
            <span>Warranty Management Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
