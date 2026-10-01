import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Search, Eye } from 'lucide-react';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System-Wide Service & Repair History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review all maintenance, repair events, and servicing costs across all users.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by repair center, description, or product name..."
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading all service records..." />
      ) : services.length === 0 ? (
        <EmptyState title="No records found" description="No maintenance history matches your query." icon={Wrench} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Account Owner</th>
                  <th className="py-3 px-4">Service Center</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Work Performed</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/products/${s.product_id}`}
                        className="font-semibold text-slate-900 hover:text-brand-600 block"
                      >
                        {s.product_name}
                      </Link>
                      <span className="text-xs text-slate-400">{s.product_brand}</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-slate-800 block">{s.owner_name}</span>
                      <span className="text-slate-400">{s.owner_email}</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-medium text-slate-800">
                      {s.service_center}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {formatDate(s.service_date)}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                      {s.description}
                    </td>

                    <td className="py-3.5 px-4 text-xs font-bold text-slate-900 text-right">
                      {formatCurrency(s.cost)}
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
