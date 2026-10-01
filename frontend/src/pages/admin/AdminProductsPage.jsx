import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Eye, Filter } from 'lucide-react';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System-Wide Products Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review all products registered across the entire application by all users.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search products by name, brand, model, or serial number..."
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading all products..." />
      ) : products.length === 0 ? (
        <EmptyState title="No products recorded" description="No products found in the database." icon={Package} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Account Owner</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Purchase Date</th>
                  <th className="py-3 px-4">Warranty Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{p.name}</span>
                      <span className="text-xs text-slate-400">{p.brand} {p.model ? `• ${p.model}` : ''}</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-slate-800 block">{p.owner_name || 'User'}</span>
                      <span className="text-slate-400">{p.owner_email}</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {p.category_name || <span className="italic text-slate-400">Uncategorized</span>}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{formatDate(p.purchase_date)}</div>
                      {p.purchase_price > 0 && (
                        <span className="text-[11px] text-slate-400">{formatCurrency(p.purchase_price)}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.warranty_status} daysRemaining={p.days_remaining} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/products/${p.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
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
