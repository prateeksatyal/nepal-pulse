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
  AlertCircle,
  FileText,
  Wrench,
  Search,
  ExternalLink,
  Shield,
  Layers,
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Products & Equipment
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              {pagination.total || products.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Full inventory of hardware assets, serial numbers, warranties, and purchase proofs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Modern Filter & Search Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search by product name, brand, model, or serial number..."
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200/90 rounded-xl p-1 bg-slate-100/70">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                aria-label="Table view"
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                aria-label="Grid view"
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Select Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-medium shadow-xs"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Warranty Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Warranty Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-medium shadow-xs"
            >
              <option value="">All Statuses</option>
              <option value="active">Active (&gt; 30 days remaining)</option>
              <option value="expiring soon">Expiring Soon (0–30 days remaining)</option>
              <option value="expired">Expired Coverage</option>
              <option value="no warranty">No Warranty Linked</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sort Sequence
            </label>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-medium shadow-xs"
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
        <LoadingSpinner label="Loading products inventory..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            search || categoryId || status
              ? "We couldn't find any products matching your active filter criteria. Try resetting search parameters."
              : "You haven't cataloged any equipment yet. Add your first product to begin tracking warranties, purchase receipts, and service logs."
          }
          icon={Package}
          actionButton={
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Product</span>
            </Link>
          }
        />
      ) : viewMode === 'table' ? (
        /* High-Density SaaS Table View */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-5">Product & Model</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Purchase Details</th>
                  <th className="py-4 px-5">Warranty Status</th>
                  <th className="py-4 px-5 text-center">Docs & Repairs</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200/80 flex-shrink-0 group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-200 transition-colors">
                          {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div className="overflow-hidden">
                          <Link
                            to={`/products/${p.id}`}
                            className="font-bold text-slate-900 hover:text-brand-600 transition-colors truncate block"
                          >
                            {p.name}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="font-semibold text-slate-700">{p.brand}</span>
                            {p.model && <span>&bull; {p.model}</span>}
                            {p.serial_number && (
                              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                SN: {p.serial_number}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      {p.category_name ? (
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
                          {p.category_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Uncategorized</span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-xs text-slate-600">
                      <div className="font-medium text-slate-800">{formatDate(p.purchase_date)}</div>
                      {p.purchase_price > 0 && (
                        <span className="font-mono font-bold text-slate-500 text-[11px]">
                          {formatCurrency(p.purchase_price)}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <StatusBadge status={p.warranty_status} daysRemaining={p.days_remaining} />
                      {p.warranty_end_date && (
                        <div className="text-[11px] text-slate-400 font-mono mt-1">
                          Expires: {formatDate(p.warranty_end_date)}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <div className="inline-flex items-center gap-2 text-xs">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/60"
                          title={`${p.receipt_count || 0} receipt(s)`}
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold">{p.receipt_count || 0}</span>
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/60"
                          title={`${p.service_count || 0} repair record(s)`}
                        >
                          <Wrench className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold">{p.service_count || 0}</span>
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/products/${p.id}`}
                          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                          title="View product details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/products/${p.id}/edit`}
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(p)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete product"
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
      ) : (
        /* Grid Card View */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
                      {p.category_name || 'Uncategorized'}
                    </span>
                    <StatusBadge status={p.warranty_status} daysRemaining={p.days_remaining} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1 truncate">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-4">
                    {p.brand} {p.model ? `• ${p.model}` : ''}
                  </p>

                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-slate-100 text-xs">
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Purchased</p>
                      <p className="font-semibold text-slate-700">{formatDate(p.purchase_date)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Cost</p>
                      <p className="font-semibold text-slate-700 font-mono">
                        {p.purchase_price > 0 ? formatCurrency(p.purchase_price) : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1" title="Receipts">
                      <FileText className="w-3.5 h-3.5" />
                      {p.receipt_count || 0}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1" title="Repairs">
                      <Wrench className="w-3.5 h-3.5" />
                      {p.service_count || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/products/${p.id}`}
                      className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/products/${p.id}/edit`}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(p)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white rounded-3xl border border-slate-200/90 shadow-card">
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
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? All associated warranties, purchase receipts, and service logs will be removed.`}
        confirmText="Yes, Delete Product"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
