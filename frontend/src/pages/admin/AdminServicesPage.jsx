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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DEDA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA]">
              <Wrench className="w-3.5 h-3.5 text-[#0F6B68]" />
              All Services
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101827] tracking-tight mt-1.5">
            Service Records
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-3xl">
            Review repair history and maintenance costs across all user accounts.
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
            placeholder="Search by repair center, description, or product name..."
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280]">
          <span>Showing {services.length} of {pagination.total || services.length} service records</span>
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
        <div className="bg-white rounded-lg border border-[#D9DEDA] overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1F3F1] border-b border-[#D9DEDA] text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Service Center</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DEDA]">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F7F7F4] transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <Link
                            to={`/products/${s.product_id}`}
                            className="font-bold text-[#101827] hover:text-[#0F6B68] transition-colors inline-flex items-center gap-1 group-hover:underline"
                          >
                            <span>{s.product_name}</span>
                            <ArrowUpRight className="w-3 h-3 text-[#6B7280] group-hover:text-[#0F6B68]" />
                          </Link>
                          <span className="text-[11px] text-[#6B7280] block">{s.product_brand}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#F1F3F1] text-[#111827] border border-[#D9DEDA] flex items-center justify-center font-bold text-[10px]">
                          {(s.owner_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-[#101827] text-xs block">{s.owner_name || 'User'}</span>
                          <span className="text-[10px] text-[#6B7280]">{s.owner_email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-[#101827] text-xs">
                        <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />
                        <span>{s.service_center}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-[#4B5563] whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                        <span>{formatDate(s.service_date)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-[#111827] max-w-sm">
                      <p className="truncate font-medium">{s.description}</p>
                      {s.notes && <p className="text-[11px] text-[#6B7280] truncate mt-0.5">{s.notes}</p>}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F1F3F1] text-[#101827] border border-[#D9DEDA]">
                        {formatCurrency(s.cost)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/products/${s.product_id}`}
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
            {services.map((s) => (
              <div key={s.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <Link
                        to={`/products/${s.product_id}`}
                        className="font-bold text-sm text-[#101827] hover:text-[#0F6B68] transition-colors"
                      >
                        {s.product_name}
                      </Link>
                      <span className="text-xs text-[#6B7280] block">
                        {s.service_center} • {formatDate(s.service_date)}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F1F3F1] text-[#101827] border border-[#D9DEDA] flex-shrink-0">
                    {formatCurrency(s.cost)}
                  </span>
                </div>

                <p className="text-xs text-[#4B5563] line-clamp-2">
                  {s.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#F1F3F1] text-xs">
                  <span className="text-[#6B7280]">{s.owner_name || 'User'}</span>
                  <Link
                    to={`/products/${s.product_id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-[#F1F3F1] hover:bg-[#D9DEDA] text-[#111827] border border-[#D9DEDA] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>View Product</span>
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
