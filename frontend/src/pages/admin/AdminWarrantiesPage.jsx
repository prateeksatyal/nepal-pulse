import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Search, Eye, Mail, CheckCircle2 } from 'lucide-react';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System-Wide Warranties Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review all warranty agreements, terms, and status calculations across accounts.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search warranties by provider, type, or product..."
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expiring soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading all warranties..." />
      ) : warranties.length === 0 ? (
        <EmptyState title="No warranties found" description="No warranty records found matching criteria." icon={Shield} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Provider & Type</th>
                  <th className="py-3 px-4">Term Dates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Reminder</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warranties.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{w.product_name}</span>
                      <span className="text-xs text-slate-400">{w.product_brand}</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-slate-800 block">{w.owner_name}</span>
                      <span className="text-slate-400">{w.owner_email}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 text-xs block">{w.provider}</span>
                      <span className="text-[11px] text-slate-400">{w.warranty_type}</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>Ends: {formatDate(w.end_date)}</div>
                      <span className="text-[11px] text-slate-400">Start: {formatDate(w.start_date)}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={w.status} daysRemaining={w.days_remaining} />
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSendReminder(w.id)}
                          disabled={emailStatus[w.id] === 'sending'}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <Mail className="w-3 h-3 text-brand-600" />
                          <span>{emailStatus[w.id] === 'sending' ? 'Sending...' : emailStatus[w.id] === 'sent' ? 'Sent ✓' : 'Alert'}</span>
                        </button>
                        {emailStatus[`${w.id}_preview`] && (
                          <a
                            href={emailStatus[`${w.id}_preview`]}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-brand-600 underline"
                          >
                            Preview
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/warranties/${w.id}`}
                        className="p-1.5 text-slate-500 hover:text-brand-600 rounded-lg inline-flex"
                      >
                        <Eye className="w-4 h-4" />
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
