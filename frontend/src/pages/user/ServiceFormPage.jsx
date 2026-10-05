import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Wrench,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Info,
  Package,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatCurrency } from '../../utils/dateUtils';

export default function ServiceFormPage() {
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
    service_date: new Date().toISOString().split('T')[0],
    service_center: '',
    description: '',
    cost: '',
    notes: '',
  });

  useEffect(() => {
    fetchProducts();
    if (isEditMode) {
      fetchExistingService();
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get('/products?limit=100');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const fetchExistingService = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/services/${id}`);
      if (res.data.success) {
        const s = res.data.data;
        setFormData({
          product_id: String(s.product_id),
          service_date: s.service_date ? s.service_date.split('T')[0] : '',
          service_center: s.service_center || '',
          description: s.description || '',
          cost: s.cost !== null && s.cost !== undefined ? s.cost : '',
          notes: s.notes || '',
        });
      }
    } catch (err) {
      setError('Failed to fetch service record.');
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
      setError('Please select a product.');
      return;
    }
    if (!formData.service_date || !formData.service_center.trim() || !formData.description.trim()) {
      setError('Service date, service center, and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        product_id: parseInt(formData.product_id, 10),
        cost: formData.cost !== '' ? parseFloat(formData.cost) : 0,
      };

      if (isEditMode) {
        await axiosClient.put(`/services/${id}`, payload);
      } else {
        await axiosClient.post('/services', payload);
      }
      navigate('/services');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service record.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => String(p.id) === String(formData.product_id));

  if (loading) {
    return <LoadingSpinner label="Loading service record..." />;
  }

  return (
    <div className="w-full space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Service History</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Service Record' : 'Log Maintenance Event'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Record repairs, diagnostic inspections, parts replacements, and associated servicing costs.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-sm text-rose-800 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Balanced 8:4 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Details (8 Cols) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Target Product */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    1. Target Asset
                  </h2>
                  <p className="text-xs text-slate-400">Select the product that was serviced</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Product <span className="text-rose-500">*</span>
                </label>
                <select
                  name="product_id"
                  required
                  disabled={isEditMode}
                  value={formData.product_id}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                >
                  <option value="">Select a registered asset...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand}) {p.model ? `— ${p.model}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Service Details */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    2. Service Information
                  </h2>
                  <p className="text-xs text-slate-400">Date, technician center, and expenses</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Service Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="service_date"
                      required
                      value={formData.service_date}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Repair / Service Cost ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Service Center / Technician <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="service_center"
                    required
                    value={formData.service_center}
                    onChange={handleChange}
                    placeholder="Authorized Service Provider, Local Repair Center, or Technician"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Performed / Diagnostic Findings <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows="3"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detail the issue diagnosed, replaced components, firmware updates, or tune-up steps performed..."
                  className="w-full px-3.5 py-2.5 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Additional Notes & Work Order Reference
                </label>
                <textarea
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Invoice number, technician contact, parts warranty reference, or followup recommendations..."
                  className="w-full px-3.5 py-2.5 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-y"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to="/services"
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition-all duration-150 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving Service Log...' : isEditMode ? 'Update Service Record' : 'Save Service Record'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Ticket Preview (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Live Ticket Preview
                </span>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-400">
                {isEditMode ? 'EDITING' : 'NEW LOG'}
              </span>
            </div>

            {/* Target Asset Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Serviced Asset
              </span>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                  <Package className="w-4 h-4 text-brand-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {selectedProduct ? selectedProduct.name : 'No product selected'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedProduct ? `${selectedProduct.brand} • ${selectedProduct.category_name || 'Asset'}` : 'Select a product from dropdown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Work Details Summary */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Service Date:
                </span>
                <span className="font-semibold text-slate-800">
                  {formData.service_date ? formatDate(formData.service_date) : 'Not specified'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Service Center:
                </span>
                <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                  {formData.service_center || 'Not specified'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  Repair Cost:
                </span>
                <span className="font-bold text-slate-900">
                  {formData.cost ? formatCurrency(parseFloat(formData.cost)) : '$0.00'}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 font-semibold block mb-1">Work Description:</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs min-h-[48px] line-clamp-3">
                  {formData.description || 'No work description provided yet.'}
                </p>
              </div>
            </div>

            {/* Best Practice Tip */}
            <div className="p-3.5 rounded-xl bg-brand-50/60 border border-brand-100 text-xs text-brand-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="w-3.5 h-3.5 text-brand-600" />
                <span>Maintenance Record Tip</span>
              </div>
              <p className="text-[11px] text-brand-800/90 leading-relaxed">
                Retain digital invoices and repair work orders. Having documented service histories increases secondary market resale value and ensures valid warranty coverage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
