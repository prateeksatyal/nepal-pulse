import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Shield, Package, Calendar, DollarSign, Tag, Hash, FileText, CheckCircle2, Sparkles } from 'lucide-react';
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

        // If optional warranty was checked, create it immediately
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
    return <LoadingSpinner label="Loading product data..." />;
  }

  const selectedCategory = categories.find((c) => String(c.id) === String(formData.category_id));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to={isEditMode ? `/products/${id}` : '/products'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {isEditMode ? 'Product Details' : 'Products List'}</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Product Details' : 'Add New Hardware Asset'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fill in the identity, purchase history, and optional initial warranty coverage.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs font-medium text-rose-700 shadow-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Balanced 2-Column Grid: Form (8 cols) + Real-time Preview (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Form Controls (xl:col-span-8) */}
        <div className="xl:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card 1: Identity & Specifications */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Identity & Hardware Specifications
                  </h2>
                  <p className="text-xs text-slate-400">Core device identifiers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. MacBook Pro 16-inch M3 Max"
                    className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand / Manufacturer <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    required
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g. Apple, Sony, Dell"
                    className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Model Number
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g. A2991"
                    className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                    placeholder="e.g. C02G1234MD6R"
                    className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    disabled={categoriesLoading}
                    className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700 disabled:bg-slate-50 shadow-xs"
                  >
                    <option value="">
                      {categoriesLoading
                        ? 'Loading categories...'
                        : categoriesError
                        ? 'Failed to load categories'
                        : 'Select Category'}
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Card 2: Purchase Details */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Purchase & Acquisition History
                  </h2>
                  <p className="text-xs text-slate-400">Date, price, and descriptive notes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Purchase Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    required
                    value={formData.purchase_date}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Product Notes & Details
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Provide hardware specifications, vendor details, or physical placement notes..."
                    className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Optional Initial Warranty for Create Mode */}
            {!isEditMode && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-bold">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        Attach Initial Warranty Policy
                      </h2>
                      <p className="text-xs text-slate-400">Optional: Link coverage terms immediately</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeWarranty}
                      onChange={(e) => setIncludeWarranty(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>

                {includeWarranty && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Warranty Provider <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="provider"
                        required={includeWarranty}
                        value={warrantyData.provider}
                        onChange={handleWarrantyChange}
                        placeholder="e.g. AppleCare+, Dell Support"
                        className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Warranty Type
                      </label>
                      <select
                        name="warranty_type"
                        value={warrantyData.warranty_type}
                        onChange={handleWarrantyChange}
                        className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
                      >
                        <option value="Manufacturer Standard">Manufacturer Standard</option>
                        <option value="Manufacturer Extended">Manufacturer Extended</option>
                        <option value="Store / Retailer">Store / Retailer Warranty</option>
                        <option value="Third-party Insurance">Third-party Insurance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Coverage Start Date
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={warrantyData.start_date}
                        onChange={handleWarrantyChange}
                        className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Coverage Expiry Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        required={includeWarranty}
                        value={warrantyData.end_date}
                        onChange={handleWarrantyChange}
                        className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Coverage Scope & Inclusions
                      </label>
                      <textarea
                        name="coverage_details"
                        rows="2"
                        value={warrantyData.coverage_details}
                        onChange={handleWarrantyChange}
                        placeholder="e.g. Accidental damage, hardware replacement, 24/7 priority support..."
                        className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to={isEditMode ? `/products/${id}` : '/products'}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving Asset...' : isEditMode ? 'Update Product' : 'Save Product'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Preview Summary Card (xl:col-span-4) */}
        <div className="xl:col-span-4 sticky top-24 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Live Asset Preview
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Card Preview
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 inline-block mb-2">
                  {selectedCategory?.name || 'Uncategorized'}
                </span>
                <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                  {formData.name || 'Untitled Hardware Product'}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {formData.brand || 'Brand'} {formData.model ? `• ${formData.model}` : ''}
                </p>
                {formData.serial_number && (
                  <p className="text-[11px] font-mono text-slate-500 mt-1 bg-slate-50 p-1 rounded-md inline-block">
                    SN: {formData.serial_number}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Purchase Date</span>
                  <span className="font-bold text-slate-800">
                    {formData.purchase_date ? formatDate(formData.purchase_date) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Purchase Price</span>
                  <span className="font-bold font-mono text-slate-800">
                    {formData.purchase_price ? formatCurrency(formData.purchase_price) : '—'}
                  </span>
                </div>
              </div>

              {includeWarranty && warrantyData.provider && (
                <div className="p-3 bg-brand-50/60 rounded-2xl border border-brand-100 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-brand-900">
                    <Shield className="w-3.5 h-3.5 text-brand-600" />
                    <span>{warrantyData.provider}</span>
                  </div>
                  <p className="text-[11px] text-brand-700">{warrantyData.warranty_type}</p>
                  {warrantyData.end_date && (
                    <p className="text-[11px] text-brand-800 font-mono">
                      Expires: {formatDate(warrantyData.end_date)}
                    </p>
                  )}
                </div>
              )}

              {formData.notes && (
                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-3 rounded-2xl border border-slate-100 line-clamp-3">
                  "{formData.notes}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
