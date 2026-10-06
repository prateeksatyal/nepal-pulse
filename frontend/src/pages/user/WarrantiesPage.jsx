import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Mail,
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
    <div className="w-full space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#D9DEDA]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight">
              Warranties
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#F1F3F1] text-slate-700 border border-[#D9DEDA]">
              {pagination.total || warranties.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track active, expiring, and expired coverage across all products.
          </p>
        </div>

        <Link
          to="/warranties/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F6B68] hover:bg-[#0B5754] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Warranty</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#D9DEDA] flex flex-col sm:flex-row items-center gap-3">
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
            className="w-full sm:w-52 px-3 py-2 bg-white border border-[#D9DEDA] rounded-md text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0F6B68]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expiring soon">Expiring Soon (&lt; 30d)</option>
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
              ? "No warranties matched your filter criteria."
              : "No warranty policies recorded yet. Attach a warranty to an equipment item."
          }
          icon={Shield}
          actionButton={
            <Link
              to="/warranties/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F6B68] hover:bg-[#0B5754] text-white text-xs font-semibold rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Warranty</span>
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-[#D9DEDA] overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1F3F1] border-b border-[#D9DEDA] text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Associated Product</th>
                  <th className="py-3 px-4">Provider & Policy</th>
                  <th className="py-3 px-4">Coverage Period</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Expiry Alert</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DEDA]">
                {warranties.map((w) => (
                  <tr key={w.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        to={`/products/${w.product_id}`}
                        className="font-semibold text-[#101827] hover:text-[#0F6B68] transition-colors block truncate max-w-xs"
                      >
                        {w.product_name}
                      </Link>
                      <span className="text-[11px] text-slate-500">{w.product_brand}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#101827]">{w.provider}</div>
                      <span className="text-[11px] text-slate-500">{w.warranty_type}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>
                        Valid until: <span className="font-semibold text-[#111827]">{formatDate(w.end_date)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Started: {formatDate(w.start_date)}</span>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={w.status} daysRemaining={w.days_remaining} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSendReminder(w.id)}
                          disabled={emailStatus[w.id] === 'sending'}
                          className="px-2.5 py-1 text-xs font-medium rounded-md border border-[#D9DEDA] text-slate-700 bg-white hover:bg-[#F1F3F1] transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#0F6B68]" />
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
                            className="text-[10px] font-medium text-[#0F6B68] hover:underline"
                          >
                            Preview
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/warranties/${w.id}`}
                          className="p-1.5 text-slate-600 hover:text-[#0F6B68] hover:bg-[#F1F3F1] rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/warranties/${w.id}/edit`}
                          className="p-1.5 text-slate-600 hover:text-[#101827] hover:bg-[#F1F3F1] rounded transition-colors"
                          title="Edit warranty"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(w)}
                          className="p-1.5 text-slate-400 hover:text-[#B42318] hover:bg-[#FDECEC] rounded transition-colors"
                          title="Delete warranty"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Record View */}
          <div className="block md:hidden divide-y divide-[#D9DEDA]">
            {warranties.map((w) => (
              <div key={w.id} className="p-4 space-y-2.5 hover:bg-[#F8FAF9] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${w.product_id}`}
                      className="font-bold text-sm text-[#101827] hover:text-[#0F6B68] truncate block"
                    >
                      {w.product_name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {w.provider} · {w.warranty_type}
                    </p>
                  </div>
                  <StatusBadge status={w.status} daysRemaining={w.days_remaining} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>Valid until: <strong className="text-[#111827]">{formatDate(w.end_date)}</strong></span>
                  <div className="flex items-center gap-2">
                    <Link to={`/warranties/${w.id}`} className="p-1 text-slate-600 hover:text-[#0F6B68]">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link to={`/warranties/${w.id}/edit`} className="p-1 text-slate-600 hover:text-[#101827]">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(w)}
                      className="p-1 text-slate-400 hover:text-[#B42318]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Warranty Policy"
        message={`Are you sure you want to delete the warranty provided by "${warrantyToDelete?.provider}" for "${warrantyToDelete?.product_name}"?`}
        confirmText="Delete Warranty"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
