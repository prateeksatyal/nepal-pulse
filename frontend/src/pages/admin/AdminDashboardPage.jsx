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
      color: 'text-[#0F6B68]',
      bg: 'bg-[#F1F3F1]',
      border: 'border-[#D9DEDA]',
      link: '/admin/users',
    },
    {
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      sublabel: 'Across all accounts',
      icon: Package,
      color: 'text-[#0F6B68]',
      bg: 'bg-[#F1F3F1]',
      border: 'border-[#D9DEDA]',
      link: '/admin/products',
    },
    {
      label: 'Total Warranties',
      value: stats?.totalWarranties || 0,
      sublabel: 'Agreements filed',
      icon: Shield,
      color: 'text-[#0F6B68]',
      bg: 'bg-[#F1F3F1]',
      border: 'border-[#D9DEDA]',
      link: '/admin/warranties',
    },
    {
      label: 'Active Warranties',
      value: stats?.activeWarranties || 0,
      sublabel: 'Covered products',
      icon: ShieldCheck,
      color: 'text-[#15803D]',
      bg: 'bg-[#EAF6EC]',
      border: 'border-[#15803D]/20',
      link: '/admin/warranties',
    },
    {
      label: 'Expiring Soon (< 30d)',
      value: stats?.expiringSoonWarranties || 0,
      sublabel: 'Action required',
      icon: Clock,
      color: 'text-[#B7791F]',
      bg: 'bg-[#FFF5DA]',
      border: 'border-[#B7791F]/20',
      link: '/admin/warranties',
    },
    {
      label: 'Expired Warranties',
      value: stats?.expiredWarranties || 0,
      sublabel: 'Terms concluded',
      icon: AlertTriangle,
      color: 'text-[#B42318]',
      bg: 'bg-[#FDECEC]',
      border: 'border-[#B42318]/20',
      link: '/admin/warranties',
    },
    {
      label: 'Service Records',
      value: stats?.totalServices || 0,
      sublabel: 'Repairs logged',
      icon: Wrench,
      color: 'text-[#0F6B68]',
      bg: 'bg-[#F1F3F1]',
      border: 'border-[#D9DEDA]',
      link: '/admin/services',
    },
    {
      label: 'Uploaded Documents',
      value: stats?.totalDocuments || 0,
      sublabel: 'Storage files',
      icon: FileText,
      color: 'text-[#0F6B68]',
      bg: 'bg-[#F1F3F1]',
      border: 'border-[#D9DEDA]',
      link: '/admin/products',
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DEDA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA]">
              <Lock className="w-3.5 h-3.5 text-[#0F6B68]" />
              Administration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101827] tracking-tight mt-1.5">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-3xl">
            Overview of system metrics, registered users, categories, and warranty coverage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/categories"
            className="px-3.5 py-2 text-xs font-semibold rounded-md bg-white border border-[#D9DEDA] text-[#111827] hover:bg-[#F1F3F1] transition-colors"
          >
            Manage Categories
          </Link>
          <Link
            to="/admin/users"
            className="px-3.5 py-2 text-xs font-semibold rounded-md bg-[#0F6B68] hover:bg-[#0B5754] text-white transition-colors"
          >
            Manage Users
          </Link>
        </div>
      </div>

      {/* System Health Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#EAF6EC] text-[#15803D] flex items-center justify-center font-bold">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">Database</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#101827]">
              <span className="w-2 h-2 rounded-full bg-[#15803D]" />
              <span>Connected &amp; Healthy</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#F1F3F1] text-[#0F6B68] flex items-center justify-center font-bold">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">Object Storage</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#101827]">
              <span className="w-2 h-2 rounded-full bg-[#15803D]" />
              <span>Active &amp; Secure</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#F1F3F1] text-[#0F6B68] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">Access Control</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#101827]">
              <span className="w-2 h-2 rounded-full bg-[#15803D]" />
              <span>Administrator Verified</span>
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
              className="p-4 rounded-lg bg-white border border-[#D9DEDA] hover:border-[#0F6B68]/50 transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-md ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-xl font-bold text-[#101827]">{card.value}</span>
                <span className="text-xs font-medium text-[#6B7280] group-hover:text-[#0F6B68] transition-colors flex items-center gap-0.5">
                  Inspect <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-1">{card.sublabel}</p>
            </Link>
          );
        })}
      </div>

      {/* Multi-Column Section: Category Distribution + Quick Admin Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Category Breakdown Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-[#D9DEDA] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9DEDA]">
            <div className="flex items-center gap-2">
              <Tags className="w-4 h-4 text-[#0F6B68]" />
              <div>
                <h3 className="text-sm font-bold text-[#101827]">Product Distribution by Category</h3>
                <p className="text-xs text-[#6B7280]">Products organized by category</p>
              </div>
            </div>
            <Link
              to="/admin/categories"
              className="text-xs font-semibold text-[#0F6B68] hover:underline"
            >
              Configure &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1F3F1] border-b border-[#D9DEDA] text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Category Name</th>
                  <th className="py-2.5 px-3">Products</th>
                  <th className="py-2.5 px-3">Distribution Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DEDA]">
                {stats?.categories && stats.categories.length > 0 ? (
                  stats.categories.map((c) => {
                    const count = parseInt(c.product_count, 10);
                    const total = stats.totalProducts || 1;
                    const pct = Math.round((count / total) * 100);

                    return (
                      <tr key={c.id} className="hover:bg-[#F7F7F4] transition-colors">
                        <td className="py-2.5 px-3 font-medium text-[#111827]">{c.name}</td>
                        <td className="py-2.5 px-3 text-[#4B5563]">
                          {count} item{count !== 1 ? 's' : ''}
                        </td>
                        <td className="py-2.5 px-3 w-48">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-[#D9DEDA] h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-[#0F6B68] h-full rounded-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-[#6B7280] w-8">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-[#6B7280]">
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
          <div className="bg-white rounded-lg border border-[#D9DEDA] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#101827] pb-2 border-b border-[#D9DEDA]">
              Administration Shortcuts
            </h3>

            <div className="space-y-2.5">
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3 rounded-md border border-[#D9DEDA] hover:bg-[#F1F3F1] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101827] group-hover:text-[#0F6B68]">User Accounts</h4>
                    <p className="text-[11px] text-[#6B7280]">Manage user roles and account permissions</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#0F6B68] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/admin/categories"
                className="flex items-center justify-between p-3 rounded-md border border-[#D9DEDA] hover:bg-[#F1F3F1] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
                    <Tags className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101827] group-hover:text-[#0F6B68]">Categories</h4>
                    <p className="text-[11px] text-[#6B7280]">Add, edit, and organize product categories</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#0F6B68] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/admin/products"
                className="flex items-center justify-between p-3 rounded-md border border-[#D9DEDA] hover:bg-[#F1F3F1] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101827] group-hover:text-[#0F6B68]">Products Directory</h4>
                    <p className="text-[11px] text-[#6B7280]">View products across all user accounts</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#0F6B68] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/admin/warranties"
                className="flex items-center justify-between p-3 rounded-md border border-[#D9DEDA] hover:bg-[#F1F3F1] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101827] group-hover:text-[#0F6B68]">Warranties</h4>
                    <p className="text-[11px] text-[#6B7280]">View warranties and monitor expiration status</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#0F6B68] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/admin/services"
                className="flex items-center justify-between p-3 rounded-md border border-[#D9DEDA] hover:bg-[#F1F3F1] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101827] group-hover:text-[#0F6B68]">Service Records</h4>
                    <p className="text-[11px] text-[#6B7280]">Review logged repairs and maintenance history</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#0F6B68] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
