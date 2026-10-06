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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DEDA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA]">
              <Shield className="w-3.5 h-3.5 text-[#0F6B68]" />
              All Warranties
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101827] tracking-tight mt-1.5">
            Warranties Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-3xl">
            View and manage warranty coverage and expiry reminders across all accounts.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#D9DEDA] flex flex-col sm:flex-row items-center justify-between gap-4">
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
            className="w-full sm:w-44 px-3 py-2 bg-white border border-[#D9DEDA] rounded-md text-xs font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68]"
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
        <div className="bg-white rounded-lg border border-[#D9DEDA] overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1F3F1] border-b border-[#D9DEDA] text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Reminder</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DEDA]">
                {warranties.map((w) => (
                  <tr key={w.id} className="hover:bg-[#F7F7F4] transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <Link
                            to={`/warranties/${w.id}`}
                            className="font-bold text-[#101827] hover:text-[#0F6B68] transition-colors inline-flex items-center gap-1 group-hover:underline"
                          >
                            <span>{w.product_name}</span>
                            <ArrowUpRight className="w-3 h-3 text-[#6B7280] group-hover:text-[#0F6B68]" />
                          </Link>
                          <span className="text-[11px] text-[#6B7280] block">{w.product_brand}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#F1F3F1] text-[#111827] border border-[#D9DEDA] flex items-center justify-center font-bold text-[10px]">
                          {(w.owner_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-[#101827] text-xs block">{w.owner_name || 'User'}</span>
                          <span className="text-[10px] text-[#6B7280]">{w.owner_email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-[#101827] text-xs">
                        <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />
                        <span>{w.provider}</span>
                      </div>
                      <span className="text-[11px] text-[#6B7280] block mt-0.5">
                        {w.warranty_type}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs text-[#4B5563] whitespace-nowrap">
                      <div className="flex items-center gap-1 font-medium text-[#101827]">
                        <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                        <span>Expires: {formatDate(w.end_date)}</span>
                      </div>
                      <span className="text-[11px] text-[#6B7280] block mt-0.5">
                        Started: {formatDate(w.start_date)}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={w.status} daysRemaining={w.days_remaining} />
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSendReminder(w.id)}
                          disabled={emailStatus[w.id] === 'sending'}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors inline-flex items-center gap-1.5 ${
                            emailStatus[w.id] === 'sent'
                              ? 'bg-[#EAF6EC] text-[#15803D] border-[#15803D]/20'
                              : 'bg-[#F1F3F1] text-[#111827] border-[#D9DEDA] hover:bg-[#D9DEDA]'
                          } disabled:opacity-50`}
                        >
                          <Mail className="w-3 h-3 text-[#0F6B68]" />
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
                            className="text-[10px] font-semibold text-[#0F6B68] hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Preview</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/warranties/${w.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-[#D9DEDA] text-[#111827] bg-[#F1F3F1] hover:bg-[#D9DEDA] transition-colors"
                      >
                        <Eye className="w-3 h-3 text-[#6B7280]" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="block md:hidden divide-y divide-[#D9DEDA]">
            {warranties.map((w) => (
              <div key={w.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <Link
                        to={`/warranties/${w.id}`}
                        className="font-bold text-sm text-[#101827] hover:text-[#0F6B68] transition-colors"
                      >
                        {w.product_name}
                      </Link>
                      <span className="text-xs text-[#6B7280] block">
                        {w.provider} • {w.warranty_type}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={w.status} daysRemaining={w.days_remaining} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#F1F3F1]">
                  <div>
                    <span className="text-[11px] text-[#6B7280] block">Owner</span>
                    <span className="font-medium text-[#111827]">{w.owner_name || 'User'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#6B7280] block">Expires</span>
                    <span className="font-medium text-[#4B5563]">{formatDate(w.end_date)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F1F3F1]">
                  <button
                    type="button"
                    onClick={() => handleSendReminder(w.id)}
                    disabled={emailStatus[w.id] === 'sending'}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors inline-flex items-center gap-1.5 ${
                      emailStatus[w.id] === 'sent'
                        ? 'bg-[#EAF6EC] text-[#15803D] border-[#15803D]/20'
                        : 'bg-[#F1F3F1] text-[#111827] border-[#D9DEDA] hover:bg-[#D9DEDA]'
                    } disabled:opacity-50`}
                  >
                    <Mail className="w-3 h-3 text-[#0F6B68]" />
                    <span>
                      {emailStatus[w.id] === 'sending'
                        ? 'Sending...'
                        : emailStatus[w.id] === 'sent'
                        ? 'Sent ✓'
                        : 'Send Alert'}
                    </span>
                  </button>

                  <Link
                    to={`/warranties/${w.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-[#F1F3F1] hover:bg-[#D9DEDA] text-[#111827] border border-[#D9DEDA] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            ))}
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
