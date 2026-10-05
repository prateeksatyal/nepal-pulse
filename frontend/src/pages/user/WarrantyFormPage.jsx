import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Shield } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          to={isEditMode ? `/warranties/${id}` : '/warranties'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {isEditMode ? 'Warranty Details' : 'Warranties'}</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditMode ? 'Edit Warranty Policy' : 'Add New Warranty'}
            </h1>
            <p className="text-xs text-slate-500">
              Specify coverage terms, provider, and duration dates.
            </p>
          </div>
        </div>

        {error && (
          <div className="my-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Associated Product Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Covered Product <span className="text-rose-500">*</span>
            </label>
            <select
              name="product_id"
              required
              disabled={isEditMode}
              value={formData.product_id}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">Choose a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.brand}) {p.serial_number ? `- SN: ${p.serial_number}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Warranty Provider <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="provider"
              required
              value={formData.provider}
              onChange={handleChange}
              placeholder="Warranty provider"
              className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Warranty Type
            </label>
            <select
              name="warranty_type"
              value={formData.warranty_type}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700"
            >
              <option value="Manufacturer Standard">Manufacturer Standard</option>
              <option value="Manufacturer Extended">Manufacturer Extended</option>
              <option value="Store / Retailer">Store / Retailer Warranty</option>
              <option value="Third-party Insurance">Third-party Insurance</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                required
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                End / Expiry Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                required
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Coverage Scope & Details
            </label>
            <textarea
              name="coverage_details"
              rows="3"
              value={formData.coverage_details}
              onChange={handleChange}
              placeholder="Coverage terms and conditions"
              className="w-full px-3 py-2 bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to={isEditMode ? `/warranties/${id}` : '/warranties'}
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
              <span>{submitting ? 'Saving...' : isEditMode ? 'Update Warranty' : 'Save Warranty'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
