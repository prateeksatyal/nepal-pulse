import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Shield, Package, Calendar, DollarSign } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/dateUtils';

export default function ProductFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Product fields
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    serial_number: '',
    category_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: '',
    notes: '',
  });

  // Optional Warranty section for new product creation
  const [includeWarranty, setIncludeWarranty] = useState(false);
  const [warrantyData, setWarrantyData] = useState({
    provider: '',
    warranty_type: 'Manufacturer Standard',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    coverage_details: '',
  });

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchExistingProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError('');
      const res = await axiosClient.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategoriesError('Could not load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchExistingProduct = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/products/${id}`);
      if (res.data.success) {
        const p = res.data.data;
        setFormData({
          name: p.name || '',
          brand: p.brand || '',
          model: p.model || '',
          serial_number: p.serial_number || '',
          category_id: p.category_id ? String(p.category_id) : '',
          purchase_date: p.purchase_date ? p.purchase_date.split('T')[0] : '',
          purchase_price: p.purchase_price !== null && p.purchase_price !== undefined ? p.purchase_price : '',
          notes: p.notes || '',
        });
      }
    } catch (err) {
      setError('Failed to fetch product information.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWarrantyChange = (e) => {
    const { name, value } = e.target;
    setWarrantyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.brand.trim() || !formData.purchase_date) {
      setError('Please provide product name, brand, and purchase date.');
      return;
    }

    if (includeWarranty && !isEditMode) {
      if (!warrantyData.provider.trim() || !warrantyData.end_date) {
        setError('Please provide warranty provider and expiry date, or disable the warranty section.');
        return;
      }
      if (new Date(warrantyData.end_date) < new Date(warrantyData.start_date)) {
        setError('Warranty end date cannot be earlier than start date.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        purchase_price: formData.purchase_price !== '' ? parseFloat(formData.purchase_price) : 0,
      };

      if (isEditMode) {
        await axiosClient.put(`/products/${id}`, payload);
        navigate(`/products/${id}`);
      } else {
        const res = await axiosClient.post('/products', payload);
        const newProductId = res.data.data.id;

        if (includeWarranty) {
          try {
            await axiosClient.post('/warranties', {
              ...warrantyData,
              product_id: newProductId,
            });
          } catch (wErr) {
            console.warn('Product created, but warranty attachment failed:', wErr);
          }
        }

        navigate(`/products/${newProductId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading product..." />;
  }

  const selectedCategory = categories.find((c) => String(c.id) === String(formData.category_id));

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="pb-2 border-b border-[#D9DEDA]">
        <Link
          to={isEditMode ? `/products/${id}` : '/products'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {isEditMode ? 'Product Details' : 'Products'}</span>
        </Link>
        <h1 className="text-2xl font-bold text-[#101827] tracking-tight">
          {isEditMode ? 'Edit Product' : 'Add Product'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter device specifications, purchase details, and optional warranty terms.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-[#FDECEC] border border-[#B42318]/30 rounded-md flex items-center gap-2 text-xs text-[#B42318]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Two-Column Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section 1: Product Information */}
            <div className="bg-white rounded-lg border border-[#D9DEDA] p-5 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#101827] pb-2 border-b border-[#D9DEDA]">
                Product Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Product Name <span className="text-[#B42318]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white text-xs sm:text-sm text-[#111827] border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Brand <span className="text-[#B42318]">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    required
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white text-xs sm:text-sm text-[#111827] border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white text-xs sm:text-sm text-[#111827] border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white text-xs sm:text-sm text-[#111827] border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] font-mono transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    disabled={categoriesLoading}
                    className="w-full px-3 py-2 bg-white text-xs sm:text-sm border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] text-slate-700"
                  >
                    <option value="">
                      {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Purchase Date <span className="text-[#B42318]">*</span>
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    required
                    value={formData.purchase_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white text-xs sm:text-sm text-[#111827] border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Purchase & Notes Information */}
            <div className="bg-white rounded-lg border border-[#D9DEDA] p-5 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#101827] pb-2 border-b border-[#D9DEDA]">
                Purchase & Notes Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Purchase Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white text-xs sm:text-sm text-[#111827] border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] font-mono transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white text-xs sm:text-sm text-[#111827] border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Optional Initial Warranty (Create mode) */}
            {!isEditMode && (
              <div className="bg-white rounded-lg border border-[#D9DEDA] p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#D9DEDA]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#0F6B68]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#101827]">
                      Initial Warranty Policy (Optional)
                    </h2>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={includeWarranty}
                      onChange={(e) => setIncludeWarranty(e.target.checked)}
                      className="rounded border-[#D9DEDA] text-[#0F6B68] focus:ring-[#0F6B68]"
                    />
                    <span>Attach Warranty</span>
                  </label>
                </div>

                {includeWarranty && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Provider <span className="text-[#B42318]">*</span>
                      </label>
                      <input
                        type="text"
                        name="provider"
                        required={includeWarranty}
                        value={warrantyData.provider}
                        onChange={handleWarrantyChange}
                        className="w-full px-3 py-2 bg-white text-xs sm:text-sm border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Warranty Type
                      </label>
                      <select
                        name="warranty_type"
                        value={warrantyData.warranty_type}
                        onChange={handleWarrantyChange}
                        className="w-full px-3 py-2 bg-white text-xs sm:text-sm border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68]"
                      >
                        <option value="Manufacturer Standard">Manufacturer Standard</option>
                        <option value="Manufacturer Extended">Manufacturer Extended</option>
                        <option value="Store / Retailer">Store / Retailer Warranty</option>
                        <option value="Third-party Insurance">Third-party Insurance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={warrantyData.start_date}
                        onChange={handleWarrantyChange}
                        className="w-full px-3 py-2 bg-white text-xs sm:text-sm border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        End Date <span className="text-[#B42318]">*</span>
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        required={includeWarranty}
                        value={warrantyData.end_date}
                        onChange={handleWarrantyChange}
                        className="w-full px-3 py-2 bg-white text-xs sm:text-sm border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Coverage Details
                      </label>
                      <textarea
                        name="coverage_details"
                        rows="2"
                        value={warrantyData.coverage_details}
                        onChange={handleWarrantyChange}
                        className="w-full px-3 py-2 bg-white text-xs sm:text-sm border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Link
                to={isEditMode ? `/products/${id}` : '/products'}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-[#D9DEDA] hover:bg-[#F1F3F1] rounded-md transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0F6B68] hover:bg-[#0B5754] rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{submitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Save Product'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Summary Card */}
        <div className="lg:col-span-4 sticky top-20">
          <div className="bg-white rounded-lg border border-[#D9DEDA] p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#101827] pb-2 border-b border-[#D9DEDA]">
              Asset Preview
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Product</span>
                <p className="font-bold text-[#101827] text-sm truncate">
                  {formData.name || 'Untitled Product'}
                </p>
                <p className="text-slate-500">
                  {formData.brand || 'Brand'} {formData.model ? `• ${formData.model}` : ''}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D9DEDA]">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Category</span>
                  <span className="font-medium text-slate-700">
                    {selectedCategory?.name || 'Uncategorized'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Purchase Date</span>
                  <span className="font-medium text-slate-700">
                    {formData.purchase_date ? formatDate(formData.purchase_date) : '—'}
                  </span>
                </div>
              </div>

              {formData.purchase_price && (
                <div className="pt-2 border-t border-[#D9DEDA]">
                  <span className="text-[10px] text-slate-400 block uppercase">Purchase Price</span>
                  <span className="font-bold font-mono text-[#111827]">
                    {formatCurrency(formData.purchase_price)}
                  </span>
                </div>
              )}

              {includeWarranty && warrantyData.provider && (
                <div className="p-2.5 bg-[#F1F3F1] rounded border border-[#D9DEDA] text-[11px] space-y-0.5">
                  <div className="flex items-center gap-1 font-semibold text-[#101827]">
                    <Shield className="w-3 h-3 text-[#0F6B68]" />
                    <span>{warrantyData.provider}</span>
                  </div>
                  <p className="text-slate-500">{warrantyData.warranty_type}</p>
                  {warrantyData.end_date && (
                    <p className="text-slate-600 font-mono">
                      Ends: {formatDate(warrantyData.end_date)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
