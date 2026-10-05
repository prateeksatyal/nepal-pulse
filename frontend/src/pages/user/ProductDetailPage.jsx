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
  ShieldCheck,
  FileCheck,
  ChevronRight,
  Sparkles,
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
      <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center max-w-lg mx-auto shadow-card">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Product Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">{error || 'This item could not be retrieved.'}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
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
    <div className="space-y-6 sm:space-y-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/products" className="hover:text-brand-600 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Products</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/products/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Product</span>
          </Link>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Product Hero Information Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50 border border-brand-200/70 px-2.5 py-0.5 rounded-lg">
                {product.category_name || 'General Product'}
              </span>
              <StatusBadge status={product.warranty_status} daysRemaining={product.days_remaining} />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Brand: <span className="font-bold text-slate-800">{product.brand}</span>
              {product.model && <span> &bull; Model: {product.model}</span>}
              {product.serial_number && (
                <span className="font-mono text-xs text-slate-600 ml-2 bg-slate-100 px-2 py-0.5 rounded-md">
                  SN: {product.serial_number}
                </span>
              )}
            </p>
          </div>

          <div className="lg:text-right flex-shrink-0 bg-slate-50 lg:bg-transparent p-4 lg:p-0 rounded-2xl border lg:border-none border-slate-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Purchase Value
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {product.purchase_price > 0 ? formatCurrency(product.purchase_price) : '—'}
            </span>
          </div>
        </div>

        {/* Specifications 4-column Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>Purchase Date</span>
            </div>
            <p className="font-bold text-slate-800 text-sm">{formatDate(product.purchase_date)}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
              <Hash className="w-3.5 h-3.5 text-brand-600" />
              <span>Serial Number</span>
            </div>
            <p className="font-mono font-bold text-slate-800 text-sm truncate">
              {product.serial_number || 'N/A'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
              <Tag className="w-3.5 h-3.5 text-brand-600" />
              <span>Category</span>
            </div>
            <p className="font-bold text-slate-800 text-sm truncate">
              {product.category_name || 'Uncategorized'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>Coverage Timeline</span>
            </div>
            <p className="font-bold text-slate-800 text-sm">
              {product.days_remaining !== null && product.days_remaining !== undefined
                ? `${product.days_remaining} days remaining`
                : 'No Warranty'}
            </p>
          </div>
        </div>

        {product.notes && (
          <div className="mt-4 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 text-xs">
            <span className="font-bold text-slate-700 block mb-1">Product Notes & Details:</span>
            <p className="text-slate-600 leading-relaxed font-normal">{product.notes}</p>
          </div>
        )}
      </div>

      {/* Balanced 2-Column Desktop Grid (7 cols : 5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (xl:col-span-7): Warranty & Service History */}
        <div className="xl:col-span-7 space-y-6 sm:space-y-8">
          {/* Warranty Section */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Warranty Policy & Terms
                  </h2>
                  <p className="text-xs text-slate-500">Official provider agreement and expiry notification</p>
                </div>
              </div>

              {warranty ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendReminder}
                    disabled={emailSending}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/60 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    title="Send test expiry reminder email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{emailSending ? 'Sending...' : 'Send Expiry Alert'}</span>
                  </button>
                  <Link
                    to={`/warranties/${warranty.id}/edit`}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200/90 text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                </div>
              ) : (
                <Link
                  to={`/warranties/new?product_id=${product.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Attach Warranty</span>
                </Link>
              )}
            </div>

            {emailResult && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{emailResult.message || 'Reminder alert email dispatched successfully!'}</span>
                </div>
                {emailResult.previewUrl && (
                  <a
                    href={emailResult.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline text-brand-700 hover:text-brand-900 ml-2"
                  >
                    Preview Email
                  </a>
                )}
              </div>
            )}

            {warranty ? (
              <div className="mt-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <span className="text-slate-400 block font-medium">Provider:</span>
                    <span className="font-bold text-slate-900 text-sm">{warranty.provider}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <span className="text-slate-400 block font-medium">Policy Type:</span>
                    <span className="font-bold text-slate-900 text-sm">{warranty.warranty_type}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <span className="text-slate-400 block font-medium">Valid Term:</span>
                    <span className="font-bold text-slate-900 text-xs">
                      {formatDate(warranty.start_date)} &rarr; {formatDate(warranty.end_date)}
                    </span>
                  </div>
                </div>

                {warranty.coverage_details && (
                  <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 text-xs text-slate-700">
                    <span className="font-bold text-slate-800 block mb-1">Coverage Scope & Terms:</span>
                    <p className="leading-relaxed">{warranty.coverage_details}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No warranty attached to this product yet.</p>
                <Link
                  to={`/warranties/new?product_id=${product.id}`}
                  className="text-brand-600 font-bold underline mt-1 inline-block"
                >
                  Attach a warranty policy now
                </Link>
              </div>
            )}
          </div>

          {/* Service & Repair History */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Service & Repair Logs
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total spent: <span className="font-bold text-slate-800">{formatCurrency(totalServiceCost)}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setServiceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Log Repair</span>
              </button>
            </div>

            {serviceRecords.length > 0 ? (
              <div className="space-y-3">
                {serviceRecords.map((sr) => (
                  <div key={sr.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{sr.service_center}</span>
                      <span className="font-mono font-extrabold text-slate-900 text-xs bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
                        {formatCurrency(sr.cost)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{sr.description}</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span>Date: {formatDate(sr.service_date)}</span>
                      <Link
                        to={`/services/${sr.id}/edit`}
                        className="text-brand-600 hover:underline font-bold"
                      >
                        Edit Record &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs">
                <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No service or repair records logged for this product.</p>
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(true)}
                  className="mt-2 text-brand-600 font-bold underline"
                >
                  Log a repair record now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (xl:col-span-5): Document Vault (Receipts + Warranty Cards) */}
        <div className="xl:col-span-5 space-y-6 sm:space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Document Vault
                  </h3>
                  <p className="text-xs text-slate-500">Private encrypted cloud storage</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {receipts.length + warrantyDocs.length} Total
              </span>
            </div>

            {/* Purchase Receipts Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Purchase Receipts ({receipts.length})
              </h4>

              {receipts.length > 0 ? (
                <div className="space-y-2">
                  {receipts.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="w-4 h-4 text-brand-600 flex-shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">{r.file_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{formatFileSize(r.file_size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <a
                          href={`/api/documents/receipts/${r.id}/download?token=${localStorage.getItem('token')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:text-brand-600 rounded-lg hover:bg-white transition-colors"
                          title="Download / View"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteReceipt(r.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
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

              <div className="pt-2">
                <FileUpload
                  onUpload={handleUploadReceipt}
                  label="Attach Purchase Receipt"
                  helperText="Allowed: PDF, JPG, JPEG, PNG (Max 10MB)"
                  buttonLabel="Select Receipt"
                />
              </div>
            </div>

            {/* Warranty Certificate Documents Section */}
            {warranty && (
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Warranty Policy Documents ({warrantyDocs.length})
                </h4>

                {warrantyDocs.length > 0 ? (
                  <div className="space-y-2">
                    {warrantyDocs.map((wd) => (
                      <div
                        key={wd.id}
                        className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">{wd.file_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{formatFileSize(wd.file_size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a
                            href={`/api/documents/warranties/${wd.id}/download?token=${localStorage.getItem('token')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-600 hover:text-brand-600 rounded-lg hover:bg-white transition-colors"
                            title="Download / View"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteWarrantyDoc(wd.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No warranty policy cards attached yet.</p>
                )}

                <div className="pt-2">
                  <FileUpload
                    onUpload={handleUploadWarrantyDoc}
                    label="Attach Warranty Policy Card"
                    helperText="Upload official policy document (Max 10MB)"
                    buttonLabel="Select Document"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Service Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-elevated max-w-lg w-full p-6 sm:p-7 border border-slate-200/80 animate-in fade-in duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Log Service & Repair Record</h3>
            <p className="text-xs text-slate-500 mb-4">Record maintenance details for {product.name}</p>

            {serviceError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{serviceError}</span>
              </div>
            )}

            <form onSubmit={handleAddServiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Service Date *
                </label>
                <input
                  type="date"
                  required
                  value={serviceForm.service_date}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, service_date: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm shadow-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Service Center / Technician *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.service_center}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, service_center: e.target.value }))
                  }
                  placeholder="e.g. Authorized Sony Service Hub"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm shadow-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description of Work *
                </label>
                <textarea
                  rows="3"
                  required
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe repair actions, diagnostic checks, replaced parts..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Repair Cost ($)
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
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Reference / Notes
                  </label>
                  <input
                    type="text"
                    value={serviceForm.notes}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Invoice # or ticket ID"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm shadow-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={serviceSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
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
