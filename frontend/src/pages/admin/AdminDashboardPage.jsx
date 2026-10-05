import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  Shield,
  Clock,
  AlertTriangle,
  Wrench,
  FileText,
  Tags,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Database,
  Cloud,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading administrative statistics..." />;
  }

  const statCards = [
    {
      label: 'Registered Users',
      value: stats?.totalUsers || 0,
      sublabel: 'Active accounts',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      link: '/admin/users',
    },
    {
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      sublabel: 'Across all users',
      icon: Package,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      border: 'border-brand-100',
      link: '/admin/products',
    },
    {
      label: 'Total Warranties',
      value: stats?.totalWarranties || 0,
      sublabel: 'Agreements filed',
      icon: Shield,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      link: '/admin/warranties',
    },
    {
      label: 'Active Warranties',
      value: stats?.activeWarranties || 0,
      sublabel: 'Covered products',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      link: '/admin/warranties',
    },
    {
      label: 'Expiring Soon (< 30d)',
      value: stats?.expiringSoonWarranties || 0,
      sublabel: 'Needs attention',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      link: '/admin/warranties',
    },
    {
      label: 'Expired Warranties',
      value: stats?.expiredWarranties || 0,
      sublabel: 'Terms concluded',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      link: '/admin/warranties',
    },
    {
      label: 'Service Records',
      value: stats?.totalServices || 0,
      sublabel: 'Repairs logged',
      icon: Wrench,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      link: '/admin/services',
    },
    {
      label: 'Uploaded Documents',
      value: stats?.totalDocuments || 0,
      sublabel: 'Storage files',
      icon: FileText,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
      link: '/admin/products',
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <Lock className="w-3.5 h-3.5 text-purple-600" />
              Administrative Root
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            System Administration Console
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            System-wide operational metrics, user accounts, category taxonomies, and multi-tenant audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/categories"
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            Manage Categories
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
          >
            Manage Users
          </Link>
        </div>
      </div>

      {/* System Health Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Database</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>PostgreSQL Engine Ready</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Object Storage</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Supabase Storage Vault (Private)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">RBAC Security</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Role-Based Access Enforcement</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-card hover:border-slate-300 transition-all block group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{card.value}</span>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-purple-600 transition-colors flex items-center gap-0.5">
                  Inspect <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{card.sublabel}</p>
            </Link>
          );
        })}
      </div>

      {/* Multi-Column Section: Category Distribution + Quick Admin Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Category Breakdown Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Tags className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Product Distribution by Category</h3>
                <p className="text-xs text-slate-400">Inventory share across defined classifications</p>
              </div>
            </div>
            <Link
              to="/admin/categories"
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
            >
              Configure &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Category Name</th>
                  <th className="py-2.5 px-3">Products</th>
                  <th className="py-2.5 px-3">Distribution Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.categories && stats.categories.length > 0 ? (
                  stats.categories.map((c) => {
                    const count = parseInt(c.product_count, 10);
                    const total = stats.totalProducts || 1;
                    const pct = Math.round((count / total) * 100);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-800">{c.name}</td>
                        <td className="py-3 px-3 font-medium text-slate-600">
                          {count} item{count !== 1 ? 's' : ''}
                        </td>
                        <td className="py-3 px-3 w-48">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-purple-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 w-8">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-slate-400">
                      No categories configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Administrative Modules (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Administrative Control Centers
            </h3>

            <div className="space-y-3">
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700">User RBAC Management</h4>
                    <p className="text-[11px] text-slate-400">Promote administrators, manage credentials</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/admin/categories"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Tags className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700">Category Taxonomy</h4>
                    <p className="text-[11px] text-slate-400">Add, edit, or clean product classifications</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/admin/products"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-700">System Product Directory</h4>
                    <p className="text-[11px] text-slate-400">Audit registered hardware across all accounts</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/admin/warranties"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Warranties & Alerts</h4>
                    <p className="text-[11px] text-slate-400">Trigger expiry notifications and audit terms</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/admin/services"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Service Logs & Costs</h4>
                    <p className="text-[11px] text-slate-400">Review technician entries and repair history</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
