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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60">
              <Wrench className="w-3.5 h-3.5 text-brand-600" />
              Maintenance & Diagnostics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Service & Repair History
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Track repair logs, maintenance expenditures, service centers, and technician work summaries across all your registered assets.
          </p>
        </div>

        <Link
          to="/services/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Service</span>
        </Link>
      </div>

      {/* Metric KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Logged Records
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {pagination.total || services.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Service Events</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Page Expenditure
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {formatCurrency(stats.totalCost)}
            </span>
            <span className="text-xs font-semibold text-emerald-600">Total Billed</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Cost / Event
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {formatCurrency(stats.avgCost)}
            </span>
            <span className="text-xs font-semibold text-slate-500">Average</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Service Centers
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {stats.centers}
            </span>
            <span className="text-xs font-semibold text-amber-600">Distinct Centers</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
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

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-slate-500 font-medium">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Log First Repair Event</span>
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Target Product</th>
                  <th className="py-3.5 px-4">Service Date</th>
                  <th className="py-3.5 px-4">Service Center</th>
                  <th className="py-3.5 px-4">Work Performed</th>
                  <th className="py-3.5 px-4">Repair Cost</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <Link
                            to={`/products/${s.product_id}`}
                            className="font-bold text-slate-900 hover:text-brand-600 transition-colors inline-flex items-center gap-1 group-hover:underline"
                          >
                            <span>{s.product_name}</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-brand-600" />
                          </Link>
                          <span className="text-xs text-slate-500 block">{s.product_brand}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 text-xs font-semibold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(s.service_date)}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-800">
                          {s.service_center}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-sm">
                      <p className="text-xs font-medium text-slate-800 line-clamp-1">{s.description}</p>
                      {s.notes && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{s.notes}</p>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-900 border border-slate-200">
                        {formatCurrency(s.cost)}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/services/${s.id}/edit`}
                          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                          title="Edit Service Record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(s)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Service Record"
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
