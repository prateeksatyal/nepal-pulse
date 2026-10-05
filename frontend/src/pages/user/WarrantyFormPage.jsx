import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Shield, Calendar, Clock, Sparkles, Package, CheckCircle2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/dateUtils';

export default function WarrantyFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    product_id: searchParams.get('product_id') || '',
    provider: '',
    warranty_type: 'Manufacturer Standard',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    coverage_details: '',
  });

  useEffect(() => {
    fetchProducts();
    if (isEditMode) {
      fetchExistingWarranty();
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get('/products?limit=100');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load products for dropdown:', err);
    }
  };

  const fetchExistingWarranty = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/warranties/${id}`);
      if (res.data.success) {
        const w = res.data.data;
        setFormData({
          product_id: String(w.product_id),
          provider: w.provider || '',
          warranty_type: w.warranty_type || 'Manufacturer Standard',
          start_date: w.start_date ? w.start_date.split('T')[0] : '',
          end_date: w.end_date ? w.end_date.split('T')[0] : '',
          coverage_details: w.coverage_details || '',
        });
      }
    } catch (err) {
      setError('Failed to fetch warranty details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.product_id) {
      setError('Please select a product for this warranty.');
      return;
    }
    if (!formData.provider.trim()) {
      setError('Warranty provider is required.');
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      setError('Both start date and end date are required.');
      return;
    }
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('Warranty end date cannot be earlier than start date.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        product_id: parseInt(formData.product_id, 10),
      };

      if (isEditMode) {
        await axiosClient.put(`/warranties/${id}`, payload);
        navigate(`/warranties/${id}`);
      } else {
        const res = await axiosClient.post('/warranties', payload);
        navigate(`/warranties/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save warranty record.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading warranty..." />;
  }

  const selectedProduct = products.find((p) => String(p.id) === String(formData.product_id));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div>
        <Link
          to={isEditMode ? `/warranties/${id}` : '/warranties'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {isEditMode ? 'Warranty Details' : 'Warranties'}</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isEditMode ? 'Edit Warranty Policy' : 'Register New Warranty Policy'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Specify coverage terms, provider agreement, and validity term dates.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs font-medium text-rose-700 shadow-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Grid: Form (8 cols) + Summary Preview (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Form Fields (xl:col-span-8) */}
        <div className="xl:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Policy Information & Scope
                  </h2>
                  <p className="text-xs text-slate-400">Provider details and validity range</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Associated Product Selector */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Covered Hardware Asset <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="product_id"
                    required
                    disabled={isEditMode}
                    value={formData.product_id}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-medium disabled:bg-slate-50 shadow-xs"
                  >
                    <option value="">Select hardware asset...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand}) {p.serial_number ? `— SN: ${p.serial_number}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Warranty Provider <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="provider"
                      required
                      value={formData.provider}
                      onChange={handleChange}
                      placeholder="e.g. AppleCare+, Sony Official Support"
                      className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Policy Classification
                    </label>
                    <select
                      name="warranty_type"
                      value={formData.warranty_type}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-medium shadow-xs"
                    >
                      <option value="Manufacturer Standard">Manufacturer Standard</option>
                      <option value="Manufacturer Extended">Manufacturer Extended</option>
                      <option value="Store / Retailer">Store / Retailer Warranty</option>
                      <option value="Third-party Insurance">Third-party Insurance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Coverage Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      required
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Coverage Expiry Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      required
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Coverage Scope & Inclusions
                  </label>
                  <textarea
                    name="coverage_details"
                    rows="3"
                    value={formData.coverage_details}
                    onChange={handleChange}
                    placeholder="Describe included repairs, parts replacement terms, labor coverage, service center details..."
                    className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to={isEditMode ? `/warranties/${id}` : '/warranties'}
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
                <span>{submitting ? 'Saving Policy...' : isEditMode ? 'Update Warranty' : 'Save Warranty'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Policy Preview (xl:col-span-4) */}
        <div className="xl:col-span-4 sticky top-24 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Live Policy Preview
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Card Preview
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mb-2">
                  {formData.warranty_type}
                </span>
                <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                  {formData.provider || 'Provider Name'}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Asset: <strong className="text-slate-800">{selectedProduct?.name || 'Selected Hardware Asset'}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Start Date</span>
                  <span className="font-bold text-slate-800">
                    {formData.start_date ? formatDate(formData.start_date) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Expiry Date</span>
                  <span className="font-bold text-slate-800">
                    {formData.end_date ? formatDate(formData.end_date) : '—'}
                  </span>
                </div>
              </div>

              {formData.coverage_details && (
                <p className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed font-normal">
                  {formData.coverage_details}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
