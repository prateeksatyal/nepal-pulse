import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Shield,
  Clock,
  AlertTriangle,
  Wrench,
  Plus,
  ArrowRight,
  ExternalLink,
  Mail,
  CheckCircle2,
  FileText,
  Sparkles,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatCurrency } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState({});

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (warrantyId) => {
    setEmailStatus((prev) => ({ ...prev, [warrantyId]: 'sending' }));
    try {
      const res = await axiosClient.post(`/warranties/${warrantyId}/send-reminder`);
      setEmailStatus((prev) => ({
        ...prev,
        [warrantyId]: res.data.previewUrl ? 'sent-preview' : 'sent',
        [`${warrantyId}_preview`]: res.data.previewUrl,
      }));
    } catch (err) {
      setEmailStatus((prev) => ({ ...prev, [warrantyId]: 'error' }));
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading workspace overview..." />;
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-brand-600',
      bg: 'bg-brand-50 border-brand-100',
      link: '/products',
      description: 'Cataloged hardware assets',
    },
    {
      label: 'Active Warranties',
      value: stats?.activeWarranties || 0,
      icon: Shield,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      link: '/warranties?status=active',
      description: '> 30 days valid coverage',
    },
    {
      label: 'Expiring Soon',
      value: stats?.expiringSoonWarranties || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
      link: '/warranties?status=expiring soon',
      highlight: (stats?.expiringSoonWarranties || 0) > 0,
      description: 'Expiring in next 30 days',
    },
    {
      label: 'Expired Warranties',
      value: stats?.expiredWarranties || 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
      link: '/warranties?status=expired',
      description: 'Requires renewal / out of term',
    },
  ];

  const totalWarranties = (stats?.activeWarranties || 0) + (stats?.expiringSoonWarranties || 0) + (stats?.expiredWarranties || 0);
  const activeRatio = totalWarranties > 0 ? Math.round(((stats?.activeWarranties || 0) / totalWarranties) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Welcome Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2.5">
            <Activity className="w-3.5 h-3.5 text-brand-600" />
            <span>Workspace Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Monitor real-time warranty status, expiry alerts, purchase receipts, and service logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/warranties/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold rounded-xl border border-slate-200/90 shadow-xs transition-all"
          >
            <Shield className="w-4 h-4 text-brand-600" />
            <span>Add Warranty</span>
          </Link>
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold rounded-xl border border-slate-200/90 shadow-xs transition-all"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Vault</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className={`p-6 rounded-3xl bg-white border transition-all hover:-translate-y-0.5 shadow-card hover:shadow-card-hover group flex flex-col justify-between ${
                card.highlight
                  ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/20'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {card.label}
                  </span>
                  <div className={`w-11 h-11 rounded-2xl ${card.bg} ${card.color} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[170px]">{card.description}</span>
                <span className="font-bold text-brand-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Multi-Column Section (8 cols : 4 cols on large screens) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (8 cols): Expiring Soon & Upcoming Warranties */}
        <div className="xl:col-span-8 space-y-6 sm:space-y-8">
          {/* Priority Alert: Expiring Soon Warranties */}
          <div className="bg-white rounded-3xl border border-amber-200 shadow-card p-6 sm:p-7 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Expiring Soon Warranties (Requires Attention)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Products whose warranty coverage will expire within the next 30 days.
                  </p>
                </div>
              </div>

              <Link
                to="/warranties?status=expiring soon"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>View All ({stats?.expiringSoonWarranties || 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats?.expiringSoonList && stats.expiringSoonList.length > 0 ? (
              <div className="divide-y divide-slate-100 mt-2">
                {stats.expiringSoonList.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <Link
                          to={`/products/${item.product_id}`}
                          className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors inline-flex items-center gap-1.5"
                        >
                          {item.product_name}
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.provider} &bull; Expires: <span className="font-bold text-slate-700">{formatDate(item.end_date)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={item.status} daysRemaining={item.days_remaining} />

                      {/* Send Email Reminder Button */}
                      <button
                        type="button"
                        onClick={() => handleSendReminder(item.id)}
                        disabled={emailStatus[item.id] === 'sending'}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                        title="Send an automated warranty expiry reminder to your email via Nodemailer"
                      >
                        <Mail className="w-3.5 h-3.5 text-brand-600" />
                        {emailStatus[item.id] === 'sending'
                          ? 'Sending...'
                          : emailStatus[item.id] === 'sent' || emailStatus[item.id] === 'sent-preview'
                          ? 'Alert Sent ✓'
                          : 'Send Alert'}
                      </button>

                      {emailStatus[`${item.id}_preview`] && (
                        <a
                          href={emailStatus[`${item.id}_preview`]}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Preview</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500 text-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2.5" />
                <p className="font-bold text-slate-800">All warranties in good standing</p>
                <p className="text-xs text-slate-500 mt-0.5">No products expire in the next 30 days.</p>
              </div>
            )}
          </div>

          {/* Upcoming Expiries Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Upcoming Expiration Schedule
                </h3>
                <p className="text-xs text-slate-500">Timeline of warranty terms sorted by closest expiry</p>
              </div>
              <Link to="/warranties" className="text-xs font-bold text-brand-600 hover:underline">
                View All &rarr;
              </Link>
            </div>

            {stats?.upcomingExpiries && stats.upcomingExpiries.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingExpiries.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="overflow-hidden pr-2">
                      <Link
                        to={`/products/${w.product_id}`}
                        className="text-xs sm:text-sm font-bold text-slate-800 hover:text-brand-600 truncate block"
                      >
                        {w.product_name}
                      </Link>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {w.provider} &bull; Valid until {formatDate(w.end_date)}
                      </p>
                    </div>
                    <StatusBadge status={w.status} daysRemaining={w.days_remaining} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No active warranty records on file.</p>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Health summary & Recent Repairs */}
        <div className="xl:col-span-4 space-y-6 sm:space-y-8">
          {/* Warranty Health Gauge Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Coverage Health
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeRatio}% Active
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
              <div
                style={{ width: `${activeRatio}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Active: ${stats?.activeWarranties || 0}`}
              />
              <div
                style={{ width: `${totalWarranties > 0 ? ((stats?.expiringSoonWarranties || 0) / totalWarranties) * 100 : 0}%` }}
                className="bg-amber-400 h-full transition-all duration-500"
                title={`Expiring: ${stats?.expiringSoonWarranties || 0}`}
              />
              <div
                style={{ width: `${totalWarranties > 0 ? ((stats?.expiredWarranties || 0) / totalWarranties) * 100 : 0}%` }}
                className="bg-rose-400 h-full transition-all duration-500"
                title={`Expired: ${stats?.expiredWarranties || 0}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Active</p>
                <p className="text-base font-extrabold text-emerald-600">{stats?.activeWarranties || 0}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Expiring</p>
                <p className="text-base font-extrabold text-amber-600">{stats?.expiringSoonWarranties || 0}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Expired</p>
                <p className="text-base font-extrabold text-rose-600">{stats?.expiredWarranties || 0}</p>
              </div>
            </div>
          </div>

          {/* Recent Service History */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Recent Repairs
                </h3>
                <p className="text-xs text-slate-400">Maintenance & service logs</p>
              </div>
              <Link to="/services" className="text-xs font-bold text-brand-600 hover:underline">
                All Logs &rarr;
              </Link>
            </div>

            {stats?.recentServices && stats.recentServices.length > 0 ? (
              <div className="space-y-3">
                {stats.recentServices.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="text-xs font-bold text-slate-800 truncate">{s.product_name}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {s.service_center} &bull; {formatDate(s.service_date)}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs flex-shrink-0">
                      {formatCurrency(s.cost)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No service records logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
