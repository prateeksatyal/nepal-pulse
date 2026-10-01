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
      console.error('Failed to delete product:', err);
      alert(err.response?.data?.message || 'Could not delete product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products & Assets</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your devices, attached warranties, purchase receipts, and service logs.
          </p>
        </div>

        <Link
          to="/products/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
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

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-brand-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                aria-label="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-brand-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Category Filter */}
          <div>
            <label className="block font-semibold text-slate-500 mb-1">Filter by Category</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700"
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
            <label className="block font-semibold text-slate-500 mb-1">Warranty Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="active">Active (&gt; 30 days)</option>
              <option value="expiring soon">Expiring Soon (0–30 days)</option>
              <option value="expired">Expired</option>
              <option value="no warranty">No Warranty</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block font-semibold text-slate-500 mb-1">Sort By</label>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700"
            >
              <option value="created_at-DESC">Recently Added</option>
              <option value="name-ASC">Product Name (A-Z)</option>
              <option value="brand-ASC">Brand (A-Z)</option>
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
              ? "We couldn't find any products matching your filters. Try clearing some search parameters."
              : "You haven't registered any products yet. Add your first product to begin tracking warranties and receipts!"
          }
          icon={Package}
          actionButton={
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Product</span>
            </Link>
          }
        />
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product & Model</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Purchase Date</th>
                  <th className="py-3 px-4">Warranty Status</th>
                  <th className="py-3 px-4 text-center">Docs & Repairs</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/products/${p.id}`}
                        className="font-semibold text-slate-900 hover:text-brand-600 transition-colors block"
                      >
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{p.brand}</span>
                        {p.model && <span>&bull; {p.model}</span>}
                        {p.serial_number && (
                          <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.2 rounded">
                            SN: {p.serial_number}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {p.category_name || (
                        <span className="text-slate-400 italic">Uncategorized</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      <div>{formatDate(p.purchase_date)}</div>
                      {p.purchase_price > 0 && (
                        <span className="text-[11px] text-slate-400">
                          {formatCurrency(p.purchase_price)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.warranty_status} daysRemaining={p.days_remaining} />
                      {p.warranty_end_date && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Exp: {formatDate(p.warranty_end_date)}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                        <span
                          className="flex items-center gap-0.5"
                          title={`${p.receipt_count || 0} receipt(s)`}
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.receipt_count || 0}</span>
                        </span>
                        <span>&bull;</span>
                        <span
                          className="flex items-center gap-0.5"
                          title={`${p.service_count || 0} repair record(s)`}
                        >
                          <Wrench className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.service_count || 0}</span>
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/products/${p.id}`}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="View product details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/products/${p.id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded">
                      {p.category_name || 'General'}
                    </span>
                    <StatusBadge
                      status={p.warranty_status}
                      daysRemaining={p.days_remaining}
                      size="sm"
                    />
                  </div>

                  <Link
                    to={`/products/${p.id}`}
                    className="font-bold text-slate-900 hover:text-brand-600 text-base leading-snug block mb-1"
                  >
                    {p.name}
                  </Link>

                  <p className="text-xs text-slate-500 mb-3">
                    {p.brand} {p.model ? `• ${p.model}` : ''}
                  </p>

                  <div className="text-xs text-slate-600 space-y-1 py-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Purchased:</span>
                      <span className="font-medium">{formatDate(p.purchase_date)}</span>
                    </div>
                    {p.purchase_price > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Price:</span>
                        <span className="font-medium">{formatCurrency(p.purchase_price)}</span>
                      </div>
                    )}
                    {p.warranty_end_date && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Warranty Ends:</span>
                        <span className="font-medium">{formatDate(p.warranty_end_date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{p.receipt_count || 0} receipt(s)</span>
                    <span>&bull;</span>
                    <span>{p.service_count || 0} repair(s)</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/products/${p.id}`}
                      className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/products/${p.id}/edit`}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(p)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white rounded-xl border border-slate-200">
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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? All associated warranties, receipts, and service history will also be permanently removed.`}
        confirmText="Yes, Delete Product"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
