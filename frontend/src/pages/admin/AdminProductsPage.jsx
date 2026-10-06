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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DEDA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA]">
              <Package className="w-3.5 h-3.5 text-[#0F6B68]" />
              All Products
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101827] tracking-tight mt-1.5">
            Products Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-3xl">
            View and inspect all products registered across user accounts.
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#D9DEDA] flex flex-col sm:flex-row items-center justify-between gap-4">
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

        <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280]">
          <span>Showing {products.length} of {pagination.total || products.length} products</span>
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
        <div className="bg-white rounded-lg border border-[#D9DEDA] overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1F3F1] border-b border-[#D9DEDA] text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Purchase Date</th>
                  <th className="py-3 px-4">Warranty Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DEDA]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7F7F4] transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <Link
                            to={`/products/${p.id}`}
                            className="font-bold text-[#101827] hover:text-[#0F6B68] transition-colors inline-flex items-center gap-1 group-hover:underline"
                          >
                            <span>{p.name}</span>
                            <ArrowUpRight className="w-3 h-3 text-[#6B7280] group-hover:text-[#0F6B68]" />
                          </Link>
                          <span className="text-[11px] text-[#6B7280] block">
                            {p.brand} {p.model ? `• ${p.model}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#F1F3F1] text-[#111827] border border-[#D9DEDA] flex items-center justify-center font-bold text-[10px]">
                          {(p.owner_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-[#101827] text-xs block">{p.owner_name || 'User'}</span>
                          <span className="text-[10px] text-[#6B7280]">{p.owner_email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F3F1] text-[#111827] border border-[#D9DEDA]">
                        {p.category_name || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs text-[#4B5563] whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#6B7280]" />
                        <span>{formatDate(p.purchase_date)}</span>
                      </div>
                      {p.purchase_price > 0 && (
                        <span className="text-[11px] font-semibold text-[#101827] block mt-0.5">
                          {formatCurrency(p.purchase_price)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={p.warranty_status} daysRemaining={p.days_remaining} />
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/products/${p.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-[#D9DEDA] text-[#111827] bg-[#F1F3F1] hover:bg-[#D9DEDA] transition-colors"
                      >
                        <Eye className="w-3 h-3 text-[#6B7280]" />
                        <span>View Product</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="block md:hidden divide-y divide-[#D9DEDA]">
            {products.map((p) => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <Link
                        to={`/products/${p.id}`}
                        className="font-bold text-sm text-[#101827] hover:text-[#0F6B68] transition-colors"
                      >
                        {p.name}
                      </Link>
                      <span className="text-xs text-[#6B7280] block">
                        {p.brand} {p.model ? `• ${p.model}` : ''}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={p.warranty_status} daysRemaining={p.days_remaining} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#F1F3F1]">
                  <div>
                    <span className="text-[11px] text-[#6B7280] block">Owner</span>
                    <span className="font-medium text-[#111827]">{p.owner_name || 'User'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#6B7280] block">Category</span>
                    <span className="font-medium text-[#4B5563]">{p.category_name || 'Uncategorized'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F1F3F1] text-xs">
                  <div className="text-[#6B7280]">
                    {formatDate(p.purchase_date)}
                    {p.purchase_price > 0 && ` • ${formatCurrency(p.purchase_price)}`}
                  </div>
                  <Link
                    to={`/products/${p.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-[#F1F3F1] hover:bg-[#D9DEDA] text-[#111827] border border-[#D9DEDA] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>View</span>
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
