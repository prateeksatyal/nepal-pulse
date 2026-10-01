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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Warranties</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status tracking, coverage terms, and automated expiry email reminders.
          </p>
        </div>

        <Link
          to="/warranties/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Warranty</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search by provider, warranty type, or product name..."
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Statuses</option>
            <option value="active">Active (&gt; 30 days)</option>
            <option value="expiring soon">Expiring Soon (0–30 days)</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading warranties..." />
      ) : warranties.length === 0 ? (
        <EmptyState
          title="No warranties found"
          description={
            search || statusFilter
              ? "No warranties matched your selected filter. Try clearing filters to see all records."
              : "No warranties have been logged yet. Register a product and attach a warranty to track expiration."
          }
          icon={Shield}
          actionButton={
            <Link
              to="/warranties/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Warranty</span>
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Associated Product</th>
                  <th className="py-3 px-4">Provider & Type</th>
                  <th className="py-3 px-4">Term Dates</th>
                  <th className="py-3 px-4">Warranty Status</th>
                  <th className="py-3 px-4 text-center">Expiry Alert</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {warranties.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/products/${w.product_id}`}
                        className="font-semibold text-slate-900 hover:text-brand-600 transition-colors block"
                      >
                        {w.product_name}
                      </Link>
                      <span className="text-xs text-slate-500">{w.product_brand}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 text-xs">{w.provider}</div>
                      <span className="text-[11px] text-slate-400">{w.warranty_type}</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>Ends: <span className="font-medium text-slate-800">{formatDate(w.end_date)}</span></div>
                      <span className="text-[11px] text-slate-400">Started: {formatDate(w.start_date)}</span>
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
                          className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                          title="Trigger Nodemailer reminder email"
                        >
                          <Mail className="w-3 h-3 text-brand-600" />
                          <span>
                            {emailStatus[w.id] === 'sending'
                              ? 'Sending...'
                              : emailStatus[w.id] === 'sent'
                              ? 'Sent ✓'
                              : 'Send Email'}
                          </span>
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
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/warranties/${w.id}`}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="View Warranty Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/warranties/${w.id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Warranty"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(w)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Warranty"
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
        title="Delete Warranty"
        message={`Are you sure you want to delete the warranty provided by "${warrantyToDelete?.provider}" for ${warrantyToDelete?.product_name}?`}
        confirmText="Yes, Delete Warranty"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
