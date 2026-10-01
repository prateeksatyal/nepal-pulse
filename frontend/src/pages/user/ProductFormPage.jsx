import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Shield, Package } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProductFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
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
      const res = await axiosClient.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
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

      if (includeWarranty && !isEditMode) {
        payload.warranty = warrantyData;
      }

      if (isEditMode) {
        await axiosClient.put(`/products/${id}`, payload);
        navigate(`/products/${id}`);
      } else {
        const res = await axiosClient.post('/products', payload);
        navigate(`/products/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product. Please verify fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading product..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to={isEditMode ? `/products/${id}` : '/products'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {isEditMode ? 'Product Details' : 'Products List'}</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditMode ? 'Edit Product Details' : 'Add New Product'}
            </h1>
            <p className="text-xs text-slate-500">
              Fill in the specifications and purchase history for your asset.
            </p>
          </div>
        </div>

        {error && (
          <div className="my-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. MacBook Pro 16, Sony Bravia 55 OLED"
                className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Brand / Manufacturer <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Apple, Dell, Samsung, LG"
                className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Model Number
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. A2485, SM-G998B"
                className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Serial Number
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                placeholder="e.g. C02G80L7MD6R"
                className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Purchase Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="purchase_date"
                required
                value={formData.purchase_date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
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
                className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Notes & Additional Specifications
              </label>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special warranty terms, configuration details, or store details..."
                className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Optional Initial Warranty Section for Create mode */}
          {!isEditMode && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/75 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-600" />
                  <span className="text-sm font-bold text-slate-900">
                    Attach Initial Warranty Now (Optional)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeWarranty}
                    onChange={(e) => setIncludeWarranty(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>

              {includeWarranty && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Warranty Provider <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="provider"
                      required={includeWarranty}
                      value={warrantyData.provider}
                      onChange={handleWarrantyChange}
                      placeholder="e.g. AppleCare+, Dell ProSupport"
                      className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Warranty Type
                    </label>
                    <select
                      name="warranty_type"
                      value={warrantyData.warranty_type}
                      onChange={handleWarrantyChange}
                      className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="Manufacturer Standard">Manufacturer Standard</option>
                      <option value="Manufacturer Extended">Manufacturer Extended</option>
                      <option value="Store / Retailer">Store / Retailer Warranty</option>
                      <option value="Third-party Insurance">Third-party Insurance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Warranty Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={warrantyData.start_date}
                      onChange={handleWarrantyChange}
                      className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Warranty End / Expiry Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      required={includeWarranty}
                      value={warrantyData.end_date}
                      onChange={handleWarrantyChange}
                      className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Coverage Details
                    </label>
                    <textarea
                      name="coverage_details"
                      rows="2"
                      value={warrantyData.coverage_details}
                      onChange={handleWarrantyChange}
                      placeholder="Covers accidental drops, battery replacements, onsite visits..."
                      className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to={isEditMode ? `/products/${id}` : '/products'}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
