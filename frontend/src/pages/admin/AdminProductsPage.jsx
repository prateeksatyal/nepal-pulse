import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Eye, Filter, User, ArrowUpRight, Calendar, DollarSign } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/forms/SearchBar';
import { formatDate, formatCurrency } from '../../utils/dateUtils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    fetchProducts();
  }, [search, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/products', {
        params: { search, page, limit: 10 },
      });
      if (res.data.success) {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load products for admin:', err);
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
              <Package className="w-3.5 h-3.5 text-purple-600" />
              Global Asset Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            System Products Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Supervisory administrative overview of all hardware products and appliances registered across all user accounts.
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search products by name, brand, model, or serial number..."
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>Showing {products.length} of {pagination.total || products.length} registered products</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading all products..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products recorded"
          description={search ? "No products match your search query." : "No products found in the database."}
          icon={Package}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Product Details</th>
                  <th className="py-3.5 px-4">Account Owner</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Purchase Info</th>
                  <th className="py-3.5 px-4">Warranty Status</th>
                  <th className="py-3.5 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <Link
                            to={`/products/${p.id}`}
                            className="font-bold text-slate-900 hover:text-brand-600 transition-colors inline-flex items-center gap-1 group-hover:underline"
                          >
                            <span>{p.name}</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-brand-600" />
                          </Link>
                          <span className="text-xs text-slate-500 block">
                            {p.brand} {p.model ? `• ${p.model}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                          {(p.owner_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 text-xs block">{p.owner_name || 'User'}</span>
                          <span className="text-[11px] text-slate-400">{p.owner_email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {p.category_name || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(p.purchase_date)}</span>
                      </div>
                      {p.purchase_price > 0 && (
                        <span className="text-[11px] font-semibold text-slate-900 block mt-0.5">
                          {formatCurrency(p.purchase_price)}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={p.warranty_status} daysRemaining={p.days_remaining} />
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Link
                        to={`/products/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inspect Asset</span>
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
