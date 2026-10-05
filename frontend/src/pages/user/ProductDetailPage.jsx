import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Shield,
  FileText,
  Wrench,
  Download,
  Plus,
  Mail,
  Calendar,
  DollarSign,
  Tag,
  Hash,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import FileUpload from '../../components/forms/FileUpload';
import { formatDate, formatCurrency, formatFileSize } from '../../utils/dateUtils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Email reminder state
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState(null);

  // Add Service modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    service_date: new Date().toISOString().split('T')[0],
    service_center: '',
    description: '',
    cost: '',
    notes: '',
  });
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [serviceError, setServiceError] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    setDeleting(true);
    try {
      await axiosClient.delete(`/products/${id}`);
      navigate('/products');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete product.');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleUploadReceipt = async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    await axiosClient.post(`/documents/receipts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    fetchProductDetails();
  };

  const handleUploadWarrantyDoc = async (file) => {
    if (!product?.warranty?.id) {
      throw new Error('Please add a warranty record before attaching warranty documents.');
    }
    const formData = new FormData();
    formData.append('document', file);
    await axiosClient.post(`/documents/warranties/${product.warranty.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    fetchProductDetails();
  };

  const handleDeleteReceipt = async (receiptId) => {
    if (!window.confirm('Delete this purchase receipt?')) return;
    try {
      await axiosClient.delete(`/documents/receipts/${receiptId}`);
      fetchProductDetails();
    } catch (err) {
      alert('Failed to delete receipt.');
    }
  };

  const handleDeleteWarrantyDoc = async (docId) => {
    if (!window.confirm('Delete this warranty card document?')) return;
    try {
      await axiosClient.delete(`/documents/warranties/${docId}`);
      fetchProductDetails();
    } catch (err) {
      alert('Failed to delete warranty document.');
    }
  };

  const handleSendReminder = async () => {
    if (!product?.warranty?.id) return;
    setEmailSending(true);
    setEmailResult(null);
    try {
      const res = await axiosClient.post(`/warranties/${product.warranty.id}/send-reminder`);
      setEmailResult(res.data);
    } catch (err) {
      alert('Failed to send reminder email.');
    } finally {
      setEmailSending(false);
    }
  };

  const handleAddServiceSubmit = async (e) => {
    e.preventDefault();
    setServiceError('');
    if (!serviceForm.service_center.trim() || !serviceForm.description.trim()) {
      setServiceError('Service center and description are required.');
      return;
    }

    setServiceSubmitting(true);
    try {
      await axiosClient.post('/services', {
        ...serviceForm,
        product_id: parseInt(id, 10),
        cost: serviceForm.cost !== '' ? parseFloat(serviceForm.cost) : 0,
      });
      setServiceModalOpen(false);
      setServiceForm({
        service_date: new Date().toISOString().split('T')[0],
        service_center: '',
        description: '',
        cost: '',
        notes: '',
      });
      fetchProductDetails();
    } catch (err) {
      setServiceError(err.response?.data?.message || 'Failed to save service record.');
    } finally {
      setServiceSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading product specifications..." />;
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">{error || 'Unable to locate this asset record.'}</p>
        <Link
          to="/products"
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700"
        >
          Return to Products
        </Link>
      </div>
    );
  }

  const warranty = product.warranty;
  const receipts = product.receipts || [];
  const warrantyDocs = product.warranty_documents || [];
  const serviceRecords = product.service_records || [];

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/products/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Product</span>
          </Link>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Product Hero Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded">
                {product.category_name || 'General Product'}
              </span>
              <StatusBadge status={product.warranty_status} daysRemaining={product.days_remaining} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{product.name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Brand: <span className="font-semibold text-slate-800">{product.brand}</span>
              {product.model && <span> &bull; Model: {product.model}</span>}
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs text-slate-400 block">Purchase Value</span>
            <span className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(product.purchase_price)}
            </span>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Purchase Date</span>
            </div>
            <p className="font-semibold text-slate-800 text-sm">{formatDate(product.purchase_date)}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <Hash className="w-3.5 h-3.5" />
              <span>Serial Number</span>
            </div>
            <p className="font-mono font-medium text-slate-800 text-sm truncate">
              {product.serial_number || 'N/A'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Category</span>
            </div>
            <p className="font-semibold text-slate-800 text-sm truncate">
              {product.category_name || 'Uncategorized'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Days Remaining</span>
            </div>
            <p className="font-semibold text-slate-800 text-sm">
              {product.days_remaining !== null && product.days_remaining !== undefined
                ? `${product.days_remaining} days`
                : 'No Warranty'}
            </p>
          </div>
        </div>

        {product.notes && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="font-semibold text-slate-700 block mb-1">Product Notes:</span>
            <p className="text-slate-600 leading-relaxed">{product.notes}</p>
          </div>
        )}
      </div>

      {/* Warranty Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Warranty Coverage</h2>
              <p className="text-xs text-slate-500">Official provider terms, dates, and expiry reminder</p>
            </div>
          </div>

          {warranty ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendReminder}
                disabled={emailSending}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                title="Send test expiry reminder email"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{emailSending ? 'Sending...' : 'Send Expiry Alert'}</span>
              </button>
              <Link
                to={`/warranties/${warranty.id}/edit`}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Edit Warranty
              </Link>
            </div>
          ) : (
            <Link
              to={`/warranties/new?product_id=${product.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Warranty</span>
            </Link>
          )}
        </div>

        {emailResult && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{emailResult.message}</span>
            </div>
            {emailResult.previewUrl && (
              <a
                href={emailResult.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline text-brand-700 ml-2"
              >
                Open Ethereal Preview &rarr;
              </a>
            )}
          </div>
        )}

        {warranty ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Warranty Provider:</span>
                <span className="font-semibold text-slate-800 text-sm">{warranty.provider}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Warranty Type:</span>
                <span className="font-semibold text-slate-800 text-sm">{warranty.warranty_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Active Term:</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {formatDate(warranty.start_date)} &rarr; {formatDate(warranty.end_date)}
                </span>
              </div>
            </div>

            {warranty.coverage_details && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-700 block mb-0.5">Coverage Scope:</span>
                {warranty.coverage_details}
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs">
            No warranty attached to this product yet.{' '}
            <Link
              to={`/warranties/new?product_id=${product.id}`}
              className="text-brand-600 font-semibold underline"
            >
              Attach a warranty now
            </Link>
          </div>
        )}
      </div>

      {/* Two Column Section: Documents (Receipts + Warranty Cards) & Service History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uploaded Documents & Receipts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900">Receipts & Warranty Cards</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {receipts.length + warrantyDocs.length} File(s)
            </span>
          </div>

          {/* List existing receipts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Purchase Receipts
            </h4>
            {receipts.length > 0 ? (
              <div className="space-y-2">
                {receipts.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-800 truncate">{r.file_name}</p>
                        <p className="text-[11px] text-slate-400">{formatFileSize(r.file_size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a
                        href={`/api/documents/receipts/${r.id}/download?token=${localStorage.getItem('token')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 hover:text-brand-600 rounded-md hover:bg-white transition-colors"
                        title="Download / View"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteReceipt(r.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white transition-colors"
                        title="Delete receipt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No purchase receipt uploaded yet.</p>
            )}

            {/* Direct Upload Widget for Receipts */}
            <div className="pt-2">
              <FileUpload
                onUpload={handleUploadReceipt}
                label="Attach New Purchase Receipt"
                helperText="Allowed: PDF, JPG, JPEG, PNG (Max 5MB)"
                buttonLabel="Select Receipt"
              />
            </div>
          </div>

          {/* List existing warranty docs if warranty exists */}
          {warranty && (
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Warranty Certificate Documents
              </h4>
              {warrantyDocs.length > 0 ? (
                <div className="space-y-2">
                  {warrantyDocs.map((wd) => (
                    <div
                      key={wd.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">{wd.file_name}</p>
                          <p className="text-[11px] text-slate-400">{formatFileSize(wd.file_size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={`/api/documents/warranties/${wd.id}/download?token=${localStorage.getItem('token')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-brand-600 rounded-md hover:bg-white transition-colors"
                          title="Download / View"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteWarrantyDoc(wd.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white transition-colors"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No warranty cards attached yet.</p>
              )}

              <div className="pt-2">
                <FileUpload
                  onUpload={handleUploadWarrantyDoc}
                  label="Attach Warranty Document"
                  helperText="Upload official warranty policy or warranty card (Max 5MB)"
                  buttonLabel="Select Document"
                />
              </div>
            </div>
          )}
        </div>

        {/* Service & Repair History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900">Service & Repair History</h3>
            </div>
            <button
              type="button"
              onClick={() => setServiceModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Repair</span>
            </button>
          </div>

          {serviceRecords.length > 0 ? (
            <div className="space-y-3">
              {serviceRecords.map((sr) => (
                <div key={sr.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm">{sr.service_center}</span>
                    <span className="font-bold text-slate-900 text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
                      {formatCurrency(sr.cost)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{sr.description}</p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>Date: {formatDate(sr.service_date)}</span>
                    <Link
                      to={`/services/${sr.id}/edit`}
                      className="text-brand-600 hover:underline font-medium"
                    >
                      Edit Record &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No service or repair records logged for this product.</p>
              <button
                type="button"
                onClick={() => setServiceModalOpen(true)}
                className="mt-2 text-brand-600 font-semibold underline"
              >
                Log a repair event now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Log Service Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Log Service / Repair Record</h3>
            <p className="text-xs text-slate-500 mb-4">Record repair details for {product.name}</p>

            {serviceError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{serviceError}</span>
              </div>
            )}

            <form onSubmit={handleAddServiceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Service Date *
                </label>
                <input
                  type="date"
                  required
                  value={serviceForm.service_date}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, service_date: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Service Center / Technician *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.service_center}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, service_center: e.target.value }))
                  }
                  placeholder="Service center or technician"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Description of Work *
                </label>
                <textarea
                  rows="2"
                  required
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe service or repair work"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={serviceForm.cost}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, cost: e.target.value }))
                  }
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={serviceForm.notes}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Additional notes or references"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={serviceSubmitting}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {serviceSubmitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${product.name}"? This will delete all attached warranties, receipts, and service history.`}
        confirmText="Yes, Delete Product"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDeleteProduct}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
