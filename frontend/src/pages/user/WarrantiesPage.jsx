import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/forms/SearchBar';
import { formatDate } from '../../utils/dateUtils';

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [warrantyToDelete, setWarrantyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Email status tracking
  const [emailStatus, setEmailStatus] = useState({});

  useEffect(() => {
    fetchWarranties();
  }, [statusFilter, search, page]);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/warranties', {
        params: {
          status: statusFilter || undefined,
          search: search || undefined,
          page,
          limit: 10,
        },
      });
      if (res.data.success) {
        setWarranties(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load warranties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (w) => {
    setWarrantyToDelete(w);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!warrantyToDelete) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/warranties/${warrantyToDelete.id}`);
      setDeleteModalOpen(false);
      setWarrantyToDelete(null);
      fetchWarranties();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete warranty.');
    } finally {
      setDeleting(false);
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
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Warranty Protection
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              {pagination.total || warranties.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status tracking, coverage terms, and automated expiry email reminders.
          </p>
        </div>

        <Link
          to="/warranties/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Warranty</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search by provider, policy type, or product name..."
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-56 px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
          >
            <option value="">All Statuses</option>
            <option value="active">Active (&gt; 30 days remaining)</option>
            <option value="expiring soon">Expiring Soon (0–30 days remaining)</option>
            <option value="expired">Expired Coverage</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading warranty policies..." />
      ) : warranties.length === 0 ? (
        <EmptyState
          title="No warranties found"
          description={
            search || statusFilter
              ? "No warranty records matched your selected filter. Try clearing filters to see all policies."
              : "No warranties have been logged yet. Register a product and attach a warranty to track expiration."
          }
          icon={Shield}
          actionButton={
            <Link
              to="/warranties/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Warranty</span>
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-5">Associated Hardware Asset</th>
                  <th className="py-4 px-5">Provider & Policy Type</th>
                  <th className="py-4 px-5">Term Dates</th>
                  <th className="py-4 px-5">Warranty Status</th>
                  <th className="py-4 px-5 text-center">Expiry Alert</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {warranties.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-5">
                      <Link
                        to={`/products/${w.product_id}`}
                        className="font-bold text-slate-900 hover:text-brand-600 transition-colors block truncate max-w-xs"
                      >
                        {w.product_name}
                      </Link>
                      <span className="text-xs text-slate-500 font-medium">{w.product_brand}</span>
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-800 text-xs sm:text-sm">{w.provider}</div>
                      <span className="text-[11px] text-slate-400 font-medium">{w.warranty_type}</span>
                    </td>

                    <td className="py-4 px-5 text-xs text-slate-600">
                      <div>
                        Valid until: <span className="font-bold text-slate-900">{formatDate(w.end_date)}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Started: {formatDate(w.start_date)}</span>
                    </td>

                    <td className="py-4 px-5">
                      <StatusBadge status={w.status} daysRemaining={w.days_remaining} />
                    </td>

                    <td className="py-4 px-5 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSendReminder(w.id)}
                          disabled={emailStatus[w.id] === 'sending'}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200/90 text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                          title="Trigger Nodemailer reminder email"
                        >
                          <Mail className="w-3.5 h-3.5 text-brand-600" />
                          <span>
                            {emailStatus[w.id] === 'sending'
                              ? 'Sending...'
                              : emailStatus[w.id] === 'sent'
                              ? 'Alert Sent ✓'
                              : 'Send Alert'}
                          </span>
                        </button>
                        {emailStatus[`${w.id}_preview`] && (
                          <a
                            href={emailStatus[`${w.id}_preview`]}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold text-brand-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Preview</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/warranties/${w.id}`}
                          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/warranties/${w.id}/edit`}
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                          title="Edit warranty"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(w)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete warranty"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Warranty Policy"
        message={`Are you sure you want to permanently delete the warranty provided by "${warrantyToDelete?.provider}" for "${warrantyToDelete?.product_name}"? Attached certificate documents will also be removed.`}
        confirmText="Yes, Delete Warranty"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
