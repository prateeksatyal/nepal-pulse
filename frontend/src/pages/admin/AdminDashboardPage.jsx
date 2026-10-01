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
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      link: '/admin/users',
    },
    {
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      link: '/admin/products',
    },
    {
      label: 'Total Warranties',
      value: stats?.totalWarranties || 0,
      icon: Shield,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      link: '/admin/warranties',
    },
    {
      label: 'Active Warranties',
      value: stats?.activeWarranties || 0,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      link: '/admin/warranties',
    },
    {
      label: 'Expiring (< 30d)',
      value: stats?.expiringSoonWarranties || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '/admin/warranties',
    },
    {
      label: 'Expired Warranties',
      value: stats?.expiredWarranties || 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      link: '/admin/warranties',
    },
    {
      label: 'Total Service Records',
      value: stats?.totalServices || 0,
      icon: Wrench,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/admin/services',
    },
    {
      label: 'Uploaded Documents',
      value: stats?.totalDocuments || 0,
      icon: FileText,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      link: '/admin/products',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
            System Administration
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Overview Console</h1>
          <p className="text-sm text-slate-500 mt-1">
            System-wide operational metrics, user records, and category configuration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/categories"
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            Manage Categories
          </Link>
          <Link
            to="/admin/users"
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
          >
            Manage Users
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid (Section 9) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all block"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{card.value}</span>
                <span className="text-xs text-brand-600 font-semibold hover:underline">View &rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Tags className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">Product Distribution by Category</h3>
          </div>
          <Link
            to="/admin/categories"
            className="text-xs font-semibold text-purple-600 hover:underline"
          >
            Configure Categories &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Category Name</th>
                <th className="py-2.5 px-3">Associated Products</th>
                <th className="py-2.5 px-3">Proportion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.categories && stats.categories.length > 0 ? (
                stats.categories.map((c) => {
                  const count = parseInt(c.product_count, 10);
                  const total = stats.totalProducts || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="py-3 px-3 font-medium text-slate-600">
                        {count} item{count !== 1 ? 's' : ''}
                      </td>
                      <td className="py-3 px-3 w-48">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-600 h-full rounded-full"
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
    </div>
  );
}
