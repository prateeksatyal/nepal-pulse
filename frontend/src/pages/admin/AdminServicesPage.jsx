import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Search, Eye, Building2, Calendar, DollarSign, ArrowUpRight } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/forms/SearchBar';
import { formatDate, formatCurrency } from '../../utils/dateUtils';

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

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
      console.error('Failed to load services for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <Wrench className="w-3.5 h-3.5 text-purple-600" />
              Maintenance Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            System Maintenance & Repair Log
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Supervisory administrative overview of diagnostic notes, repairs, and maintenance expenditures across all registered products.
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
            placeholder="Search by repair center, description, or product name..."
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>Showing {services.length} of {pagination.total || services.length} logged repair events</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading all service records..." />
      ) : services.length === 0 ? (
        <EmptyState
          title="No records found"
          description={search ? "No maintenance history matches your query." : "No service records have been logged in the system yet."}
          icon={Wrench}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Target Product</th>
                  <th className="py-3.5 px-4">Account Owner</th>
                  <th className="py-3.5 px-4">Service Center</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Work Performed</th>
                  <th className="py-3.5 px-4">Repair Cost</th>
                  <th className="py-3.5 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:scale-105 transition-transform">
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
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                          {(s.owner_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 text-xs block">{s.owner_name || 'User'}</span>
                          <span className="text-[11px] text-slate-400">{s.owner_email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.service_center}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(s.service_date)}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-700 max-w-sm">
                      <p className="truncate font-medium">{s.description}</p>
                      {s.notes && <p className="text-[11px] text-slate-400 truncate mt-0.5">{s.notes}</p>}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-900 border border-slate-200">
                        {formatCurrency(s.cost)}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Link
                        to={`/products/${s.product_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors shadow-xs"
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
