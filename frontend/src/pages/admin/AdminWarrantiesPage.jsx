import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Search,
  Eye,
  Mail,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/forms/SearchBar';
import { formatDate } from '../../utils/dateUtils';

export default function AdminWarrantiesPage() {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [emailStatus, setEmailStatus] = useState({});

  useEffect(() => {
    fetchWarranties();
  }, [search, statusFilter, page]);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/warranties', {
        params: { search, status: statusFilter || undefined, page, limit: 10 },
      });
      if (res.data.success) {
        setWarranties(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load warranties for admin:', err);
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
        [warrantyId]: 'sent',
        [`${warrantyId}_preview`]: res.data.previewUrl,
      }));
    } catch (err) {
      setEmailStatus((prev) => ({ ...prev, [warrantyId]: 'error' }));
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              Global Warranty Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            System Warranties Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Supervisory administrative overview of warranty agreements, coverage calculations, and reminder notification triggers.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search warranties by provider, type, or product..."
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-44 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="expiring soon">Expiring Soon (&lt; 30d)</option>
            <option value="expired">Expired Only</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading all warranties..." />
      ) : warranties.length === 0 ? (
        <EmptyState
          title="No warranties found"
          description={search || statusFilter ? "No warranty records match your criteria." : "No warranties registered in the system."}
          icon={Shield}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Covered Product</th>
                  <th className="py-3.5 px-4">Account Owner</th>
                  <th className="py-3.5 px-4">Provider & Terms</th>
                  <th className="py-3.5 px-4">Coverage Period</th>
                  <th className="py-3.5 px-4">Coverage Status</th>
                  <th className="py-3.5 px-4 text-center">Expiry Alert</th>
                  <th className="py-3.5 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warranties.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <Link
                            to={`/warranties/${w.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 group-hover:underline"
                          >
                            <span>{w.product_name}</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                          </Link>
                          <span className="text-xs text-slate-500 block">{w.product_brand}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                          {(w.owner_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 text-xs block">{w.owner_name || 'User'}</span>
                          <span className="text-[11px] text-slate-400">{w.owner_email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-xs">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{w.provider}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        {w.warranty_type}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Expires: {formatDate(w.end_date)}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Started: {formatDate(w.start_date)}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={w.status} daysRemaining={w.days_remaining} />
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSendReminder(w.id)}
                          disabled={emailStatus[w.id] === 'sending'}
                          className={`px-3 py-1 text-xs font-semibold rounded-xl border transition-all inline-flex items-center gap-1.5 ${
                            emailStatus[w.id] === 'sent'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'
                          } disabled:opacity-50`}
                        >
                          <Mail className="w-3 h-3 text-indigo-600" />
                          <span>
                            {emailStatus[w.id] === 'sending'
                              ? 'Sending...'
                              : emailStatus[w.id] === 'sent'
                              ? 'Sent ✓'
                              : 'Send Alert'}
                          </span>
                        </button>
                        {emailStatus[`${w.id}_preview`] && (
                          <a
                            href={emailStatus[`${w.id}_preview`]}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-semibold text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Preview email</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Link
                        to={`/warranties/${w.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.page || 1}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.total || 0}
            pageSize={10}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
    </div>
  );
}
