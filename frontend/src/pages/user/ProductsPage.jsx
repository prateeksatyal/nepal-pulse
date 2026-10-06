import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  FileText,
  Wrench,
  Search,
  ExternalLink,
  Shield,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import SearchBar from '../../components/forms/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatCurrency } from '../../utils/dateUtils';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryId, status, sortBy, order, page]);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/products', {
        params: {
          search,
          category_id: categoryId || undefined,
          status: status || undefined,
          sort_by: sortBy,
          order,
          page,
          limit: 10,
        },
      });
      if (res.data.success) {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/products/${productToDelete.id}`);
      setDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#D9DEDA]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101827] tracking-tight">
              Products
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#F1F3F1] text-slate-700 border border-[#D9DEDA]">
              {pagination.total || products.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View and manage registered equipment, purchase dates, and warranty status.
          </p>
        </div>

        <Link
          to="/products/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F6B68] hover:bg-[#0B5754] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-[#D9DEDA] space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search products by name, brand, model, or serial number..."
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center border border-[#D9DEDA] rounded-md p-0.5 bg-[#F1F3F1]">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-[#0F6B68]' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-[#0F6B68]' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#D9DEDA] text-xs">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] text-slate-800"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Warranty Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] text-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="expiring soon">Expiring Soon (&lt; 30d)</option>
              <option value="expired">Expired</option>
              <option value="no warranty">No Warranty</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Sort By
            </label>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] text-slate-800"
            >
              <option value="created_at-DESC">Recently Added (Newest)</option>
              <option value="name-ASC">Product Name (A &rarr; Z)</option>
              <option value="brand-ASC">Brand Name (A &rarr; Z)</option>
              <option value="purchase_date-DESC">Purchase Date (Newest)</option>
              <option value="warranty_end_date-ASC">Warranty Expiry (Soonest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner label="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            search || categoryId || status
              ? "No products match the filter criteria."
              : "No equipment registered yet. Add your first product to begin."
          }
          icon={Package}
          actionButton={
            <Link
              to="/products/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F6B68] hover:bg-[#0B5754] text-white text-xs font-semibold rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
          }
        />
      ) : viewMode === 'table' ? (
        /* Data Table View (Desktop table + Mobile cards) */
        <div className="bg-white rounded-lg border border-[#D9DEDA] overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1F3F1] border-b border-[#D9DEDA] text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Product & Model</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Purchase Info</th>
                  <th className="py-3 px-4">Warranty Status</th>
                  <th className="py-3 px-4 text-center">Files & Repairs</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DEDA]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#F1F3F1] text-slate-700 font-bold flex items-center justify-center border border-[#D9DEDA] flex-shrink-0 text-xs">
                          {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div className="overflow-hidden">
                          <Link
                            to={`/products/${p.id}`}
                            className="font-semibold text-[#101827] hover:text-[#0F6B68] transition-colors truncate block"
                          >
                            {p.name}
                          </Link>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span>{p.brand}</span>
                            {p.model && <span>&bull; {p.model}</span>}
                            {p.serial_number && (
                              <span className="font-mono text-[10px] text-slate-400">
                                (SN: {p.serial_number})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {p.category_name || <span className="italic text-slate-400">Uncategorized</span>}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{formatDate(p.purchase_date)}</div>
                      {p.purchase_price > 0 && (
                        <span className="text-[11px] font-mono text-slate-500">
                          {formatCurrency(p.purchase_price)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={p.warranty_status} daysRemaining={p.days_remaining} size="sm" />
                      {p.warranty_end_date && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {formatDate(p.warranty_end_date)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>{p.receipt_count || 0}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-slate-400" />
                          <span>{p.service_count || 0}</span>
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/products/${p.id}`}
                          className="p-1.5 text-slate-600 hover:text-[#0F6B68] hover:bg-[#F1F3F1] rounded transition-colors"
                          title="View product details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/products/${p.id}/edit`}
                          className="p-1.5 text-slate-600 hover:text-[#101827] hover:bg-[#F1F3F1] rounded transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(p)}
                          className="p-1.5 text-slate-400 hover:text-[#B42318] hover:bg-[#FDECEC] rounded transition-colors"
                          title="Delete product"
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
            {products.map((p) => (
              <div key={p.id} className="p-4 space-y-2.5 hover:bg-[#F8FAF9] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${p.id}`}
                      className="font-bold text-sm text-[#101827] hover:text-[#0F6B68] truncate block"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.brand} {p.category_name ? `· ${p.category_name}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={p.warranty_status} daysRemaining={p.days_remaining} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>
                    {formatDate(p.purchase_date)}
                    {p.purchase_price > 0 ? ` · ${formatCurrency(p.purchase_price)}` : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/products/${p.id}`}
                      className="p-1 text-slate-600 hover:text-[#0F6B68]"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/products/${p.id}/edit`}
                      className="p-1 text-slate-600 hover:text-[#101827]"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(p)}
                      className="p-1 text-slate-400 hover:text-[#B42318]"
                      title="Delete"
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
      ) : (
        /* Grid Card View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg border border-[#D9DEDA] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] text-slate-600 font-medium">
                      {p.category_name || 'Uncategorized'}
                    </span>
                    <StatusBadge status={p.warranty_status} daysRemaining={p.days_remaining} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-[#101827] tracking-tight truncate">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    {p.brand} {p.model ? `• ${p.model}` : ''}
                  </p>

                  <div className="grid grid-cols-2 gap-2 py-2 border-t border-[#D9DEDA] text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400">Purchased</p>
                      <p className="font-medium text-slate-700">{formatDate(p.purchase_date)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Cost</p>
                      <p className="font-medium text-slate-700 font-mono">
                        {p.purchase_price > 0 ? formatCurrency(p.purchase_price) : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D9DEDA] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="flex items-center gap-1" title="Receipts">
                      <FileText className="w-3 h-3" />
                      {p.receipt_count || 0}
                    </span>
                    <span className="flex items-center gap-1" title="Repairs">
                      <Wrench className="w-3 h-3" />
                      {p.service_count || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/products/${p.id}`}
                      className="p-1 text-slate-600 hover:text-[#0F6B68] rounded transition-colors"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/products/${p.id}/edit`}
                      className="p-1 text-slate-600 hover:text-slate-900 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(p)}
                      className="p-1 text-slate-400 hover:text-[#B42318] rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border border-[#D9DEDA] overflow-hidden">
            <Pagination
              currentPage={pagination.page || 1}
              totalPages={pagination.totalPages || 1}
              totalItems={pagination.total || 0}
              pageSize={10}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? All associated warranties, purchase receipts, and service logs will be permanently removed.`}
        confirmText="Delete Product"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
