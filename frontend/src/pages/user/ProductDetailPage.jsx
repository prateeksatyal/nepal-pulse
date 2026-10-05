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
  Hash,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
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
    if (!window.confirm('Delete this warranty document?')) return;
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
    return <LoadingSpinner label="Loading product..." />;
  }

  if (error || !product) {
    return (
      <div className="p-8 bg-white rounded-lg border border-[#D9DEDA] text-center max-w-md mx-auto">
        <AlertCircle className="w-8 h-8 text-[#B42318] mx-auto mb-2" />
        <h2 className="text-base font-bold text-[#101827] mb-1">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">{error || 'This product could not be loaded.'}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F6B68] text-white text-xs font-semibold rounded-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Products</span>
        </Link>
      </div>
    );
  }

  const warranty = product.warranty;
  const receipts = product.receipts || [];
  const warrantyDocs = product.warranty_documents || [];
  const serviceRecords = product.service_records || [];
  const totalServiceCost = serviceRecords.reduce((sum, s) => sum + parseFloat(s.cost || 0), 0);

  return (
    <div className="w-full space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#D9DEDA]">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/products" className="hover:text-[#101827] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Products</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-[#101827] font-semibold truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/products/${id}/edit`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#D9DEDA] hover:bg-[#F1F3F1] text-slate-700 text-xs font-medium rounded-md transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit</span>
          </Link>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#D9DEDA] hover:bg-[#FDECEC] text-[#B42318] text-xs font-medium rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Product Hero Info Card */}
      <div className="bg-white rounded-lg border border-[#D9DEDA] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#D9DEDA]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-slate-600 bg-[#F1F3F1] px-2 py-0.5 rounded border border-[#D9DEDA]">
                {product.category_name || 'Uncategorized'}
              </span>
              <StatusBadge status={product.warranty_status} daysRemaining={product.days_remaining} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#101827] tracking-tight">
              {product.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {product.brand} {product.model ? `• ${product.model}` : ''}
              {product.serial_number && (
                <span className="font-mono text-[11px] text-slate-600 ml-2">
                  (SN: {product.serial_number})
                </span>
              )}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Purchase Price
            </span>
            <span className="text-xl font-bold text-[#101827] font-mono">
              {product.purchase_price > 0 ? formatCurrency(product.purchase_price) : '—'}
            </span>
          </div>
        </div>

        {/* Specifications Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F7F7F4] border border-[#D9DEDA] rounded-md">
            <span className="text-[10px] text-slate-400 block uppercase">Purchase Date</span>
            <span className="font-semibold text-slate-800">{formatDate(product.purchase_date)}</span>
          </div>
          <div className="p-3 bg-[#F7F7F4] border border-[#D9DEDA] rounded-md">
            <span className="text-[10px] text-slate-400 block uppercase">Serial Number</span>
            <span className="font-mono font-semibold text-slate-800 truncate block">
              {product.serial_number || 'N/A'}
            </span>
          </div>
          <div className="p-3 bg-[#F7F7F4] border border-[#D9DEDA] rounded-md">
            <span className="text-[10px] text-slate-400 block uppercase">Category</span>
            <span className="font-semibold text-slate-800 truncate block">
              {product.category_name || 'Uncategorized'}
            </span>
          </div>
          <div className="p-3 bg-[#F7F7F4] border border-[#D9DEDA] rounded-md">
            <span className="text-[10px] text-slate-400 block uppercase">Coverage Status</span>
            <span className="font-semibold text-slate-800">
              {product.days_remaining !== null && product.days_remaining !== undefined
                ? `${product.days_remaining}d remaining`
                : 'No Warranty'}
            </span>
          </div>
        </div>

        {product.notes && (
          <div className="p-3 bg-[#F7F7F4] border border-[#D9DEDA] rounded-md text-xs text-slate-700">
            <span className="font-semibold block mb-0.5">Notes:</span>
            <p>{product.notes}</p>
          </div>
        )}
      </div>

      {/* Two Column Layout: Warranty & Services (7) vs Documents (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Warranty Policy & Service Records */}
        <div className="lg:col-span-7 space-y-6">
          {/* Warranty Section */}
          <div className="bg-white rounded-lg border border-[#D9DEDA] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DEDA]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0F6B68]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#101827]">
                  Warranty Agreement
                </h2>
              </div>

              {warranty ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendReminder}
                    disabled={emailSending}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-[#F1F3F1] text-slate-700 hover:bg-slate-200 border border-[#D9DEDA] transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#0F6B68]" />
                    <span>{emailSending ? 'Sending...' : 'Send Alert'}</span>
                  </button>
                  <Link
                    to={`/warranties/${warranty.id}/edit`}
                    className="px-2.5 py-1 text-xs font-medium rounded-md border border-[#D9DEDA] text-slate-700 hover:bg-[#F1F3F1]"
                  >
                    Edit
                  </Link>
                </div>
              ) : (
                <Link
                  to={`/warranties/new?product_id=${product.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md bg-[#0F6B68] text-white hover:bg-[#0B5754]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Warranty</span>
                </Link>
              )}
            </div>

            {emailResult && (
              <div className="p-2.5 bg-[#EAF6EC] border border-[#15803D]/20 rounded text-xs text-[#15803D] flex items-center justify-between">
                <span>{emailResult.message || 'Reminder email dispatched.'}</span>
                {emailResult.previewUrl && (
                  <a
                    href={emailResult.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline ml-2"
                  >
                    Preview
                  </a>
                )}
              </div>
            )}

            {warranty ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 bg-[#F7F7F4] border border-[#D9DEDA] rounded">
                    <span className="text-[10px] text-slate-400 block uppercase">Provider</span>
                    <span className="font-semibold text-[#101827]">{warranty.provider}</span>
                  </div>
                  <div className="p-2.5 bg-[#F7F7F4] border border-[#D9DEDA] rounded">
                    <span className="text-[10px] text-slate-400 block uppercase">Type</span>
                    <span className="font-semibold text-[#101827]">{warranty.warranty_type}</span>
                  </div>
                  <div className="p-2.5 bg-[#F7F7F4] border border-[#D9DEDA] rounded">
                    <span className="text-[10px] text-slate-400 block uppercase">Coverage Term</span>
                    <span className="font-semibold text-[#101827]">
                      {formatDate(warranty.start_date)} &rarr; {formatDate(warranty.end_date)}
                    </span>
                  </div>
                </div>

                {warranty.coverage_details && (
                  <div className="p-3 bg-[#F7F7F4] border border-[#D9DEDA] rounded text-slate-700">
                    <span className="font-semibold block mb-0.5">Coverage Scope:</span>
                    <p>{warranty.coverage_details}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No warranty attached to this product.</p>
            )}
          </div>

          {/* Service & Repair History */}
          <div className="bg-white rounded-lg border border-[#D9DEDA] p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DEDA]">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#0F6B68]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#101827]">
                  Service & Repair History
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-mono">
                  Total: {formatCurrency(totalServiceCost)}
                </span>
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#0F6B68] text-white hover:bg-[#0B5754]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Repair</span>
                </button>
              </div>
            </div>

            {serviceRecords.length > 0 ? (
              <div className="divide-y divide-[#D9DEDA] text-xs">
                {serviceRecords.map((sr) => (
                  <div key={sr.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#101827]">{sr.service_center}</span>
                      <span className="font-mono font-semibold text-[#111827]">
                        {formatCurrency(sr.cost)}
                      </span>
                    </div>
                    <p className="text-slate-600">{sr.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Date: {formatDate(sr.service_date)}</span>
                      <Link to={`/services/${sr.id}/edit`} className="text-[#0F6B68] hover:underline">
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No repair records logged for this product.</p>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Document Vault */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-lg border border-[#D9DEDA] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DEDA]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0F6B68]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#101827]">
                  Document Vault
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {receipts.length + warrantyDocs.length} files
              </span>
            </div>

            {/* Purchase Receipts */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-700 block">
                Purchase Receipts ({receipts.length})
              </span>

              {receipts.length > 0 ? (
                <div className="space-y-1.5">
                  {receipts.map((r) => (
                    <div
                      key={r.id}
                      className="p-2.5 bg-[#F7F7F4] rounded border border-[#D9DEDA] flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <p className="font-medium text-[#101827] truncate">{r.file_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{formatFileSize(r.file_size)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={`/api/documents/receipts/${r.id}/download?token=${localStorage.getItem('token')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-600 hover:text-[#0F6B68]"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteReceipt(r.id)}
                          className="p-1 text-slate-400 hover:text-[#B42318]"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No purchase receipt uploaded.</p>
              )}

              <div className="pt-2">
                <FileUpload
                  onUpload={handleUploadReceipt}
                  label="Upload Receipt"
                  buttonLabel="Select File"
                />
              </div>
            </div>

            {/* Warranty Documents */}
            {warranty && (
              <div className="space-y-2 pt-4 border-t border-[#D9DEDA] text-xs">
                <span className="font-semibold text-slate-700 block">
                  Warranty Documents ({warrantyDocs.length})
                </span>

                {warrantyDocs.length > 0 ? (
                  <div className="space-y-1.5">
                    {warrantyDocs.map((wd) => (
                      <div
                        key={wd.id}
                        className="p-2.5 bg-[#F7F7F4] rounded border border-[#D9DEDA] flex items-center justify-between"
                      >
                        <div className="truncate pr-2">
                          <p className="font-medium text-[#101827] truncate">{wd.file_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{formatFileSize(wd.file_size)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a
                            href={`/api/documents/warranties/${wd.id}/download?token=${localStorage.getItem('token')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-600 hover:text-[#0F6B68]"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteWarrantyDoc(wd.id)}
                            className="p-1 text-slate-400 hover:text-[#B42318]"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No warranty policy documents attached.</p>
                )}

                <div className="pt-2">
                  <FileUpload
                    onUpload={handleUploadWarrantyDoc}
                    label="Upload Warranty Document"
                    buttonLabel="Select File"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Service Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full p-5 border border-[#D9DEDA]">
            <h3 className="text-sm font-bold text-[#101827] mb-0.5">Log Service & Repair</h3>
            <p className="text-xs text-slate-500 mb-3">{product.name}</p>

            {serviceError && (
              <div className="mb-3 p-2.5 bg-[#FDECEC] border border-[#B42318]/30 rounded text-xs text-[#B42318] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{serviceError}</span>
              </div>
            )}

            <form onSubmit={handleAddServiceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Service Date *
                </label>
                <input
                  type="date"
                  required
                  value={serviceForm.service_date}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, service_date: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Service Center / Technician *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.service_center}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, service_center: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Description of Work *
                </label>
                <textarea
                  rows="2"
                  required
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
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
                    className="w-full px-2.5 py-1.5 border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={serviceForm.notes}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 border border-[#D9DEDA] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F6B68]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D9DEDA]">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-[#F1F3F1] rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={serviceSubmitting}
                  className="px-3.5 py-1.5 bg-[#0F6B68] hover:bg-[#0B5754] text-white rounded font-semibold disabled:opacity-50"
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
        confirmText="Delete Product"
        loading={deleting}
        onConfirm={handleDeleteProduct}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
