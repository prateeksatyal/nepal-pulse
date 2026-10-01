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
    return <LoadingSpinner label="Loading your dashboard..." />;
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      link: '/products',
    },
    {
      label: 'Active Warranties',
      value: stats?.activeWarranties || 0,
      icon: Shield,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      link: '/warranties?status=active',
    },
    {
      label: 'Expiring Soon (< 30d)',
      value: stats?.expiringSoonWarranties || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '/warranties?status=expiring soon',
      highlight: (stats?.expiringSoonWarranties || 0) > 0,
    },
    {
      label: 'Expired Warranties',
      value: stats?.expiredWarranties || 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      link: '/warranties?status=expired',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'User'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is the current operational status of your registered assets and warranties.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className={`p-5 rounded-2xl bg-white border transition-all hover:shadow-md ${
                card.highlight ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{card.value}</span>
                <span className="text-xs text-brand-600 font-medium flex items-center gap-0.5 hover:underline">
                  View &rarr;
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Feature 4 & 10: "Expiring Soon" Priority Action Section */}
      <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Expiring Soon Warranties (Requires Attention)
              </h2>
              <p className="text-xs text-slate-500">
                Products whose warranty will expire within the next 30 days.
              </p>
            </div>
          </div>
          <Link
            to="/warranties?status=expiring soon"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            See all ({stats?.expiringSoonWarranties || 0}) &rarr;
          </Link>
        </div>

        {stats?.expiringSoonList && stats.expiringSoonList.length > 0 ? (
          <div className="divide-y divide-slate-100 mt-2">
            {stats.expiringSoonList.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <Link
                      to={`/products/${item.product_id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-brand-600 transition-colors inline-flex items-center gap-1"
                    >
                      {item.product_name}
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                    <p className="text-xs text-slate-500">
                      {item.provider} &bull; Expires: <span className="font-medium text-slate-700">{formatDate(item.end_date)}</span>
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
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50"
                    title="Send an automated warranty expiry reminder to your email via Nodemailer"
                  >
                    <Mail className="w-3.5 h-3.5 text-brand-600" />
                    {emailStatus[item.id] === 'sending'
                      ? 'Sending...'
                      : emailStatus[item.id] === 'sent' || emailStatus[item.id] === 'sent-preview'
                      ? 'Sent ✓'
                      : 'Send Alert'}
                  </button>

                  {emailStatus[`${item.id}_preview`] && (
                    <a
                      href={emailStatus[`${item.id}_preview`]}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-brand-600 hover:underline"
                    >
                      Preview Email
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">All clear!</p>
            <p className="text-xs text-slate-500">No warranties are expiring within the next 30 days.</p>
          </div>
        )}
      </div>

      {/* Two Column Layout: Upcoming Expiries & Recent Repairs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Expiries */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Upcoming Expiries
            </h3>
            <Link to="/warranties" className="text-xs font-semibold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          {stats?.upcomingExpiries && stats.upcomingExpiries.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingExpiries.map((w) => (
                <div
                  key={w.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="overflow-hidden pr-2">
                    <Link
                      to={`/products/${w.product_id}`}
                      className="text-sm font-semibold text-slate-800 hover:text-brand-600 truncate block"
                    >
                      {w.product_name}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">
                      {w.provider} &bull; {formatDate(w.end_date)}
                    </p>
                  </div>
                  <StatusBadge status={w.status} daysRemaining={w.days_remaining} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-6 text-center">No active warranties recorded.</p>
          )}
        </div>

        {/* Recent Service & Repair Records */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Service History
            </h3>
            <Link to="/services" className="text-xs font-semibold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          {stats?.recentServices && stats.recentServices.length > 0 ? (
            <div className="space-y-3">
              {stats.recentServices.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="overflow-hidden pr-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">{s.product_name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {s.service_center} &bull; {formatDate(s.service_date)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200">
                    {formatCurrency(s.cost)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-6 text-center">No repair history logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
