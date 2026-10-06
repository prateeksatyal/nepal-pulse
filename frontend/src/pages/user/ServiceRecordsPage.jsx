import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  Search,
  Building2,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingDown,
  Clock,
  Sparkles,
  Receipt,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/forms/SearchBar';
import { formatDate, formatCurrency } from '../../utils/dateUtils';

export default function ServiceRecordsPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [search, page]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/services', {
        params: { search, page, limit: 10 },
      });
      if (res.data.success) {
        setServices(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (s) => {
    setServiceToDelete(s);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/services/${serviceToDelete.id}`);
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (err) {
      alert('Failed to delete service record.');
    } finally {
      setDeleting(false);
    }
  };

  // Quick statistics summary from the current view
  const stats = useMemo(() => {
    const totalCost = services.reduce((acc, s) => acc + (parseFloat(s.cost) || 0), 0);
    const avgCost = services.length > 0 ? totalCost / services.length : 0;
    const centers = new Set(services.map((s) => s.service_center).filter(Boolean)).size;
    return { totalCost, avgCost, centers };
  }, [services]);

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DEDA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA]">
              <Wrench className="w-3 h-3 text-[#0F6B68]" />
              Maintenance & Diagnostics
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101827] tracking-tight mt-1.5">
            Service & Repair History
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-3xl">
            Track repairs, service centers, and maintenance costs for your equipment.
          </p>
        </div>

        <Link
          to="/services/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0F6B68] hover:bg-[#0B5754] text-white text-xs font-semibold rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Log Service</span>
        </Link>
      </div>

      {/* Metric KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Total Logged Records
            </span>
            <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#101827]">
              {pagination.total || services.length}
            </span>
            <span className="text-[11px] font-medium text-[#6B7280]">Service Events</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Total Expenditure
            </span>
            <div className="w-8 h-8 rounded-md bg-[#EAF6EC] text-[#15803D] border border-[#15803D]/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#101827]">
              {formatCurrency(stats.totalCost)}
            </span>
            <span className="text-[11px] font-medium text-[#15803D]">Total Billed</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Avg Cost / Event
            </span>
            <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#101827]">
              {formatCurrency(stats.avgCost)}
            </span>
            <span className="text-[11px] font-medium text-[#6B7280]">Average</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Service Centers
            </span>
            <div className="w-8 h-8 rounded-md bg-[#FFF5DA] text-[#B7791F] border border-[#B7791F]/20 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#101827]">
              {stats.centers}
            </span>
            <span className="text-[11px] font-medium text-[#B7791F]">Distinct Centers</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#D9DEDA] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search by repair center, description, or product name..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-[#6B7280] font-medium">
          <span>Showing {services.length} of {pagination.total || services.length} records</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading service history..." />
      ) : services.length === 0 ? (
        <EmptyState
          title="No service records logged"
          description={
            search
              ? 'No service records match your search criteria.'
              : 'You have not logged any repairs or maintenance events for your products yet.'
          }
          icon={Wrench}
          actionButton={
            <Link
              to="/services/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F6B68] hover:bg-[#0B5754] text-white text-xs font-semibold rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Log First Repair Event</span>
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-[#D9DEDA] overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F1F3F1] border-b border-[#D9DEDA] text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider">
                  <th className="py-3 px-4">Target Product</th>
                  <th className="py-3 px-4">Service Date</th>
                  <th className="py-3 px-4">Service Center</th>
                  <th className="py-3 px-4">Work Performed</th>
                  <th className="py-3 px-4">Repair Cost</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DEDA] text-xs">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F7F7F4] transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#4B5563] flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-[#0F6B68]/10 group-hover:text-[#0F6B68] transition-colors border border-[#D9DEDA]">
                          <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <Link
                            to={`/products/${s.product_id}`}
                            className="font-bold text-[#111827] hover:text-[#0F6B68] transition-colors inline-flex items-center gap-1 group-hover:underline"
                          >
                            <span>{s.product_name}</span>
                            <ArrowUpRight className="w-3 h-3 text-[#6B7280] group-hover:text-[#0F6B68]" />
                          </Link>
                          <span className="text-[11px] text-[#6B7280] block">{s.product_brand}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F1F3F1] border border-[#D9DEDA] text-xs font-medium text-[#4B5563]">
                        <Calendar className="w-3 h-3 text-[#6B7280]" />
                        <span>{formatDate(s.service_date)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-[#6B7280] flex-shrink-0" />
                        <span className="text-xs font-medium text-[#111827]">
                          {s.service_center}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-xs font-medium text-[#111827] line-clamp-1">{s.description}</p>
                      {s.notes && (
                        <p className="text-[11px] text-[#6B7280] line-clamp-1 mt-0.5">{s.notes}</p>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F1F3F1] text-[#101827] border border-[#D9DEDA]">
                        {formatCurrency(s.cost)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/services/${s.id}/edit`}
                          className="p-1.5 text-[#4B5563] hover:text-[#0F6B68] hover:bg-[#F1F3F1] rounded-md transition-colors"
                          title="Edit Service Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(s)}
                          className="p-1.5 text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Service Record"
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
            {services.map((s) => (
              <div key={s.id} className="p-4 space-y-2 hover:bg-[#F8FAF9] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${s.product_id}`}
                      className="font-bold text-sm text-[#101827] hover:text-[#0F6B68] truncate block"
                    >
                      {s.product_name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.service_center} · {formatDate(s.service_date)}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F1F3F1] text-[#101827] border border-[#D9DEDA]">
                    {formatCurrency(s.cost)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 line-clamp-2">{s.description}</p>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Link
                    to={`/services/${s.id}/edit`}
                    className="p-1 text-slate-600 hover:text-[#0F6B68]"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(s)}
                    className="p-1 text-slate-400 hover:text-[#B42318]"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
        title="Delete Service Record"
        message="Are you sure you want to delete this maintenance record? This action will permanently remove it from your service log."
        confirmText="Yes, Delete Record"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
