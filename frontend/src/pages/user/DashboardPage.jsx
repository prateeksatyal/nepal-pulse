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
  FileText,
  Activity,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
    return <LoadingSpinner label="Loading workspace data..." />;
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-slate-700',
      bg: 'bg-[#F1F3F1]',
      link: '/products',
      description: 'Registered hardware assets',
    },
    {
      label: 'Active Warranties',
      value: stats?.activeWarranties || 0,
      icon: Shield,
      color: 'text-[#15803D]',
      bg: 'bg-[#EAF6EC]',
      link: '/warranties?status=active',
      description: 'Active coverage terms',
    },
    {
      label: 'Expiring Soon',
      value: stats?.expiringSoonWarranties || 0,
      icon: Clock,
      color: 'text-[#B7791F]',
      bg: 'bg-[#FFF5DA]',
      link: '/warranties?status=expiring soon',
      highlight: (stats?.expiringSoonWarranties || 0) > 0,
      description: 'Expiring within 30 days',
    },
    {
      label: 'Expired Warranties',
      value: stats?.expiredWarranties || 0,
      icon: AlertTriangle,
      color: 'text-[#B42318]',
      bg: 'bg-[#FDECEC]',
      link: '/warranties?status=expired',
      description: 'Coverage elapsed',
    },
  ];

  const totalWarranties = (stats?.activeWarranties || 0) + (stats?.expiringSoonWarranties || 0) + (stats?.expiredWarranties || 0);
  const activeRatio = totalWarranties > 0 ? Math.round(((stats?.activeWarranties || 0) / totalWarranties) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#D9DEDA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Workspace Overview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight mt-1">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time status for your cataloged equipment, warranty terms, and service logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F6B68] hover:bg-[#0B5754] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/warranties/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F1F3F1] text-slate-700 text-xs font-medium rounded-md border border-[#D9DEDA] transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-[#0F6B68]" />
            <span>Add Warranty</span>
          </Link>
          <Link
            to="/documents"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F1F3F1] text-slate-700 text-xs font-medium rounded-md border border-[#D9DEDA] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Vault</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className={`p-4 rounded-lg bg-white border border-[#D9DEDA] transition-colors hover:border-slate-400 block ${
                card.highlight ? 'bg-[#FFF5DA]/30' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-md ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#101827] tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{card.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Main Real Dashboard Layout (8 cols : 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Expiring Soon & Upcoming Warranties */}
        <div className="lg:col-span-8 space-y-6">
          {/* Priority Alert: Expiring Soon Warranties */}
          <div className="bg-white rounded-lg border border-[#D9DEDA] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F1F3F1] border-b border-[#D9DEDA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B7791F]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#101827]">
                  Expiring Soon (Next 30 Days)
                </h2>
              </div>
              <Link
                to="/warranties?status=expiring soon"
                className="text-xs font-semibold text-[#0F6B68] hover:underline"
              >
                View All ({stats?.expiringSoonWarranties || 0})
              </Link>
            </div>

            {stats?.expiringSoonList && stats.expiringSoonList.length > 0 ? (
              <div className="divide-y divide-[#D9DEDA]">
                {stats.expiringSoonList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAF9] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#FFF5DA] text-[#B7791F] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <Link
                          to={`/products/${item.product_id}`}
                          className="text-xs font-bold text-[#101827] hover:text-[#0F6B68] transition-colors inline-flex items-center gap-1"
                        >
                          <span>{item.product_name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.provider} &bull; Ends: <span className="font-semibold text-slate-700">{formatDate(item.end_date)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <StatusBadge status={item.status} daysRemaining={item.days_remaining} size="sm" />

                      <button
                        type="button"
                        onClick={() => handleSendReminder(item.id)}
                        disabled={emailStatus[item.id] === 'sending'}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-[#F1F3F1] border border-[#D9DEDA] rounded-md transition-colors flex items-center gap-1 disabled:opacity-50"
                        title="Send expiry alert email"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#0F6B68]" />
                        <span>
                          {emailStatus[item.id] === 'sending'
                            ? 'Sending...'
                            : emailStatus[item.id] === 'sent' || emailStatus[item.id] === 'sent-preview'
                            ? 'Sent ✓'
                            : 'Send Alert'}
                        </span>
                      </button>

                      {emailStatus[`${item.id}_preview`] && (
                        <a
                          href={emailStatus[`${item.id}_preview`]}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-[#0F6B68] hover:underline"
                        >
                          Preview
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                <p className="font-semibold text-[#101827]">No active expiration warnings</p>
                <p className="text-slate-500 mt-0.5">All tracked products have coverage extending beyond 30 days.</p>
              </div>
            )}
          </div>

          {/* Upcoming Expiries Schedule */}
          <div className="bg-white rounded-lg border border-[#D9DEDA] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F1F3F1] border-b border-[#D9DEDA] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#101827]">
                Upcoming Expiration Schedule
              </h3>
              <Link to="/warranties" className="text-xs font-semibold text-[#0F6B68] hover:underline">
                View All Warranties &rarr;
              </Link>
            </div>

            {stats?.upcomingExpiries && stats.upcomingExpiries.length > 0 ? (
              <div className="divide-y divide-[#D9DEDA]">
                {stats.upcomingExpiries.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAF9] transition-colors"
                  >
                    <div className="truncate pr-2">
                      <Link
                        to={`/products/${w.product_id}`}
                        className="text-xs font-semibold text-[#101827] hover:text-[#0F6B68] truncate block"
                      >
                        {w.product_name}
                      </Link>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {w.provider} &bull; Valid through {formatDate(w.end_date)}
                      </p>
                    </div>
                    <StatusBadge status={w.status} daysRemaining={w.days_remaining} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 p-6 text-center">No active warranty records on file.</p>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Health Gauge & Recent Repairs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Warranty Health Breakdown */}
          <div className="bg-white rounded-lg border border-[#D9DEDA] p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#101827]">
                Coverage Health
              </h3>
              <span className="text-xs font-semibold text-[#15803D]">
                {activeRatio}% Active
              </span>
            </div>

            {/* Simple Progress Bar */}
            <div className="w-full bg-[#F1F3F1] rounded h-2 overflow-hidden flex">
              <div
                style={{ width: `${activeRatio}%` }}
                className="bg-[#15803D] h-full"
              />
              <div
                style={{ width: `${totalWarranties > 0 ? ((stats?.expiringSoonWarranties || 0) / totalWarranties) * 100 : 0}%` }}
                className="bg-[#B7791F] h-full"
              />
              <div
                style={{ width: `${totalWarranties > 0 ? ((stats?.expiredWarranties || 0) / totalWarranties) * 100 : 0}%` }}
                className="bg-[#B42318] h-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#D9DEDA] text-center text-xs">
              <div>
                <p className="text-[11px] text-slate-400">Active</p>
                <p className="font-bold text-[#15803D]">{stats?.activeWarranties || 0}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Expiring</p>
                <p className="font-bold text-[#B7791F]">{stats?.expiringSoonWarranties || 0}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Expired</p>
                <p className="font-bold text-[#B42318]">{stats?.expiredWarranties || 0}</p>
              </div>
            </div>
          </div>

          {/* Recent Service History */}
          <div className="bg-white rounded-lg border border-[#D9DEDA] overflow-hidden">
            <div className="px-4 py-3 bg-[#F1F3F1] border-b border-[#D9DEDA] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#101827]">
                Recent Repairs
              </h3>
              <Link to="/services" className="text-xs font-semibold text-[#0F6B68] hover:underline">
                All Logs &rarr;
              </Link>
            </div>

            {stats?.recentServices && stats.recentServices.length > 0 ? (
              <div className="divide-y divide-[#D9DEDA]">
                {stats.recentServices.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 flex items-center justify-between gap-2 hover:bg-[#F8FAF9] transition-colors"
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-semibold text-[#101827] truncate">{s.product_name}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {s.service_center} &bull; {formatDate(s.service_date)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#111827] bg-[#F1F3F1] px-2 py-0.5 rounded border border-[#D9DEDA] flex-shrink-0">
                      {formatCurrency(s.cost)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 p-5 text-center">No service records logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
