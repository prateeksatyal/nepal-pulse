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
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <Link
          to={isEditMode ? `/warranties/${id}` : '/warranties'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B5563] hover:text-[#111827] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {isEditMode ? 'Warranty Details' : 'Warranties'}</span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-[#101827] tracking-tight">
          {isEditMode ? 'Edit Warranty' : 'Add Warranty'}
        </h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Add warranty provider details, validity period, and coverage terms.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs font-medium text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Grid: Form (8 cols) + Summary Preview (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Form Fields (xl:col-span-8) */}
        <div className="xl:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg border border-[#D9DEDA] p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#D9DEDA]">
                <div className="w-9 h-9 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#101827] tracking-tight">
                    Policy Information & Scope
                  </h2>
                  <p className="text-xs text-[#6B7280]">Provider details and validity range</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Associated Product Selector */}
                <div>
                  <label className="block font-semibold text-[#111827] text-xs mb-1.5">
                    Covered Hardware Asset <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="product_id"
                    required
                    disabled={isEditMode}
                    value={formData.product_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white text-xs border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] text-[#111827] font-medium disabled:bg-[#F1F3F1]"
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
                    <label className="block font-semibold text-[#111827] text-xs mb-1.5">
                      Warranty Provider <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="provider"
                      required
                      value={formData.provider}
                      onChange={handleChange}
                      placeholder="Provider or manufacturer name"
                      className="w-full px-3 py-2 bg-white text-xs border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] text-[#111827]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#111827] text-xs mb-1.5">
                      Policy Classification
                    </label>
                    <select
                      name="warranty_type"
                      value={formData.warranty_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white text-xs border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] text-[#111827] font-medium"
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
                    <label className="block font-semibold text-[#111827] text-xs mb-1.5">
                      Coverage Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      required
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white text-xs border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] text-[#111827]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#111827] text-xs mb-1.5">
                      Coverage Expiry Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      required
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white text-xs border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] text-[#111827]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#111827] text-xs mb-1.5">
                    Coverage Scope & Inclusions
                  </label>
                  <textarea
                    name="coverage_details"
                    rows="3"
                    value={formData.coverage_details}
                    onChange={handleChange}
                    placeholder="Enter coverage scope, parts replacement terms, or service terms"
                    className="w-full px-3 py-2 bg-white text-xs border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68] focus:border-[#0F6B68] text-[#111827]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to={isEditMode ? `/warranties/${id}` : '/warranties'}
                className="px-4 py-2 text-xs font-semibold text-[#4B5563] bg-white border border-[#D9DEDA] hover:bg-[#F1F3F1] rounded-md transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0F6B68] hover:bg-[#0B5754] rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving Policy...' : isEditMode ? 'Update Warranty' : 'Save Warranty'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Policy Preview (xl:col-span-4) */}
        <div className="xl:col-span-4 sticky top-24 space-y-5">
          <div className="bg-white rounded-lg border border-[#D9DEDA] p-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#D9DEDA] mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F6B68]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#101827]">
                  Policy Summary
                </h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F3F1] text-[#4B5563] border border-[#D9DEDA]">
                Preview
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EAF6EC] text-[#15803D] border border-[#15803D]/20 inline-block mb-2">
                  {formData.warranty_type}
                </span>
                <h4 className="text-base font-bold text-[#101827] tracking-tight">
                  {formData.provider || 'Provider Name'}
                </h4>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                  Asset: <strong className="text-[#101827]">{selectedProduct?.name || 'Selected Hardware Asset'}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#D9DEDA] text-xs">
                <div>
                  <span className="text-[11px] text-[#6B7280] font-medium block">Start Date</span>
                  <span className="font-semibold text-[#101827]">
                    {formData.start_date ? formatDate(formData.start_date) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#6B7280] font-medium block">Expiry Date</span>
                  <span className="font-semibold text-[#101827]">
                    {formData.end_date ? formatDate(formData.end_date) : '—'}
                  </span>
                </div>
              </div>

              {formData.coverage_details && (
                <p className="text-[11px] text-[#4B5563] bg-[#F1F3F1] p-3 rounded-md border border-[#D9DEDA] leading-relaxed font-normal">
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
