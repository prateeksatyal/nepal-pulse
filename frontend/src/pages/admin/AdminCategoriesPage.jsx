import React, { useState, useEffect, useMemo } from 'react';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Save,
  X,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setPageError('');
      const res = await axiosClient.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setPageError(err.response?.data?.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setModalError('');
    setModalOpen(true);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!name.trim()) {
      setModalError('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await axiosClient.put(`/categories/${editingCategory.id}`, {
          name: name.trim(),
          description: description.trim(),
        });
      } else {
        await axiosClient.post('/categories', {
          name: name.trim(),
          description: description.trim(),
        });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/categories/${categoryToDelete.id}`);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    } finally {
      setDeleting(false);
    }
  };

  const totalAssignedProducts = useMemo(() => {
    return categories.reduce((acc, c) => acc + (parseInt(c.product_count, 10) || 0), 0);
  }, [categories]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DEDA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA]">
              <Tags className="w-3.5 h-3.5 text-[#0F6B68]" />
              Categories
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101827] tracking-tight mt-1.5">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-3xl">
            Manage product categories used to organize equipment and hardware.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0F6B68] hover:bg-[#0B5754] text-white text-xs font-semibold rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {pageError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span className="font-medium">{pageError}</span>
          </div>
          <button
            type="button"
            onClick={fetchCategories}
            className="px-2.5 py-1 bg-white border border-rose-200 rounded text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Total Categories
            </span>
            <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
              <Tags className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#101827]">{categories.length}</span>
            <span className="text-[11px] font-medium text-[#6B7280]">Active Categories</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Assigned Products
            </span>
            <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#101827]">{totalAssignedProducts}</span>
            <span className="text-[11px] font-medium text-[#6B7280]">Total Products</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Average Density
            </span>
            <div className="w-8 h-8 rounded-md bg-[#EAF6EC] text-[#15803D] border border-[#15803D]/20 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#101827]">
              {categories.length > 0 ? (totalAssignedProducts / categories.length).toFixed(1) : 0}
            </span>
            <span className="text-[11px] font-medium text-[#15803D]">Products / Category</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading categories..." />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Create your first product category using the 'Add New Category' button above."
          icon={Tags}
          actionButton={
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F6B68] hover:bg-[#0B5754] text-white text-xs font-semibold rounded-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-[#D9DEDA] overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1F3F1] border-b border-[#D9DEDA] text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Products</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DEDA]">
                {categories.map((cat) => {
                  const count = parseInt(cat.product_count, 10) || 0;
                  return (
                    <tr key={cat.id} className="hover:bg-[#F7F7F4] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center font-bold text-xs flex-shrink-0">
                            <Tags className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-[#101827]">{cat.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-[#4B5563] max-w-md">
                        {cat.description || <span className="italic text-[#6B7280]">No description provided</span>}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#F1F3F1] text-[#101827] border border-[#D9DEDA]">
                          <Package className="w-3 h-3 text-[#6B7280]" />
                          <span>{count} product{count !== 1 ? 's' : ''}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 text-[#4B5563] hover:text-[#0F6B68] hover:bg-[#F1F3F1] rounded-md transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(cat)}
                            className="p-1.5 text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="block md:hidden divide-y divide-[#D9DEDA]">
            {categories.map((cat) => {
              const count = parseInt(cat.product_count, 10) || 0;
              return (
                <div key={cat.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <Tags className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-sm text-[#101827]">{cat.name}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#F1F3F1] text-[#101827] border border-[#D9DEDA] flex-shrink-0">
                      <Package className="w-3 h-3 text-[#6B7280]" />
                      <span>{count}</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#4B5563]">
                    {cat.description || <span className="italic text-[#6B7280]">No description provided</span>}
                  </p>

                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#F1F3F1]">
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      className="px-2.5 py-1 text-xs font-medium text-[#4B5563] hover:text-[#0F6B68] bg-[#F1F3F1] hover:bg-[#D9DEDA] rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(cat)}
                      className="p-1 text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-[#D9DEDA]">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DEDA] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
                  <Tags className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-[#101827]">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#6B7280] hover:text-[#101827] rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#111827] mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] text-xs text-[#111827]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111827] mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Classification description or scope"
                  className="w-full px-3 py-2 border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] text-xs text-[#111827] resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D9DEDA]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#4B5563] bg-white border border-[#D9DEDA] hover:bg-[#F1F3F1] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#0F6B68] hover:bg-[#0B5754] text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? Products currently in this category will become Uncategorized.`}
        confirmText="Yes, Delete Category"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
