import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Package,
  Wrench,
  FileCheck2,
  BellRing,
  Search,
  SlidersHorizontal,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      title: 'Product Management',
      desc: 'Catalog your devices, electronics, and appliances with serial numbers, purchase dates, and prices.',
      icon: Package,
    },
    {
      title: 'Automatic Warranty Tracking',
      desc: 'Real-time calculation of Active (>30d), Expiring Soon (0–30d), and Expired status badges.',
      icon: ShieldCheck,
    },
    {
      title: 'Service & Repair History',
      desc: 'Log maintenance records, costs, repair centers, and service descriptions for each product.',
      icon: Wrench,
    },
    {
      title: 'Receipt & Document Storage',
      desc: 'Securely upload and retrieve purchase receipts and warranty cards in PDF, JPG, and PNG formats.',
      icon: FileCheck2,
    },
    {
      title: 'Live Product Search',
      desc: 'Debounced search by product name, brand, model, or serial number powered by PostgreSQL.',
      icon: Search,
    },
    {
      title: 'Warranty Expiry Reminders',
      desc: 'Nodemailer email alerts notifying you before warranties expire so you can claim service.',
      icon: BellRing,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-xl">WarrantyFlow</span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm transition-colors"
              >
                Go to Dashboard &rarr;
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm transition-colors"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          3rd Semester Web Development University Project
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Manage Products, Warranties, Receipts & Repairs in One Place
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A full-stack web application featuring automatic status calculation, receipt uploads,
          comprehensive CRUD modules, and automated expiry email reminders.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Start Managing Assets</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Demo Credentials Login
          </Link>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-10 p-4 max-w-xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Pre-Configured Demo Accounts:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-800">Normal User:</span>
              <p className="text-slate-600 mt-0.5">user@warranty.com</p>
              <p className="text-slate-400">Password: user123</p>
            </div>
            <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-100">
              <span className="font-semibold text-purple-900">Administrator:</span>
              <p className="text-purple-700 mt-0.5">admin@warranty.com</p>
              <p className="text-purple-400">Password: admin123</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              10 Core Project Features Built to University Specifications
            </h2>
            <p className="mt-3 text-slate-600 text-sm">
              Strictly implementing the 4 required CRUD operations, role-based authorization, backend validation, and clean MVC architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-200">Warranty Management System</p>
            <p className="text-slate-500 mt-0.5">3rd Semester Web Development Project &bull; React, Node.js, Express, PostgreSQL</p>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <span>&bull;</span>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
