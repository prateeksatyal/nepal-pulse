import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Download,
  Mail,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Package,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import FileUpload from '../../components/forms/FileUpload';
import { formatDate, formatFileSize } from '../../utils/dateUtils';

export default function WarrantyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [warranty, setWarranty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Email Reminder State
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderResult, setReminderResult] = useState(null);

  useEffect(() => {
    fetchWarrantyDetails();
  }, [id]);

  const fetchWarrantyDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/warranties/${id}`);
      if (res.data.success) {
        setWarranty(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch warranty details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosClient.delete(`/warranties/${id}`);
      navigate('/warranties');
    } catch (err) {
      alert('Could not delete warranty.');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleUploadDocument = async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    await axiosClient.post(`/documents/warranties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    fetchWarrantyDetails();
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this warranty document?')) return;
    try {
      await axiosClient.delete(`/documents/warranties/${docId}`);
      fetchWarrantyDetails();
    } catch (err) {
      alert('Failed to delete document.');
    }
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    setReminderResult(null);
    try {
      const res = await axiosClient.post(`/warranties/${id}/send-reminder`);
      setReminderResult(res.data);
    } catch (err) {
      alert('Failed to send reminder email.');
    } finally {
      setSendingReminder(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading warranty terms..." />;
  }

  if (error || !warranty) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center max-w-lg mx-auto shadow-card">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Warranty Record Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">{error || 'Unable to locate this policy.'}</p>
        <Link
          to="/warranties"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Warranties</span>
        </Link>
      </div>
    );
  }

  // Calculate visual progress percentage between start date and end date
  const startDate = new Date(warranty.start_date).getTime();
  const endDate = new Date(warranty.end_date).getTime();
  const todayDate = new Date().getTime();
  const totalDuration = Math.max(1, endDate - startDate);
  const elapsed = Math.max(0, todayDate - startDate);
  const progressPercent = Math.min(100, Math.round((elapsed / totalDuration) * 100));

  const documents = warranty.documents || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/warranties" className="hover:text-brand-600 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Warranties</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 truncate max-w-[200px]">{warranty.provider}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSendReminder}
            disabled={sendingReminder}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl border border-brand-200/80 shadow-xs transition-colors disabled:opacity-50"
          >
            <Mail className="w-3.5 h-3.5 text-brand-600" />
            <span>{sendingReminder ? 'Sending...' : 'Send Expiry Notice'}</span>
          </button>
          <Link
            to={`/warranties/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {reminderResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{reminderResult.message}</span>
          </div>
          {reminderResult.previewUrl && (
            <a
              href={reminderResult.previewUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold underline text-brand-700 ml-2"
            >
              Preview Email &rarr;
            </a>
          )}
        </div>
      )}

      {/* Balanced 2-Column Desktop Grid (7 cols : 5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Main Policy Overview (xl:col-span-7) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                    {warranty.warranty_type}
                  </span>
                  <StatusBadge status={warranty.status} daysRemaining={warranty.days_remaining} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {warranty.provider}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  Covered Product:{' '}
                  <Link
                    to={`/products/${warranty.product_id}`}
                    className="font-bold text-brand-600 hover:underline inline-flex items-center gap-1"
                  >
                    {warranty.product_name}
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                </p>
              </div>

              <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Remaining Term
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {warranty.days_remaining !== null && warranty.days_remaining !== undefined
                    ? `${warranty.days_remaining} days`
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Visual Progress Timeline */}
            <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Start: <strong className="text-slate-800">{formatDate(warranty.start_date)}</strong></span>
                <span className="font-bold text-slate-800">
                  {warranty.is_expired ? 'Coverage Expired' : `${100 - progressPercent}% Term Remaining`}
                </span>
                <span>Expiry: <strong className="text-slate-800">{formatDate(warranty.end_date)}</strong></span>
              </div>
              <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    warranty.is_expired
                      ? 'bg-rose-500'
                      : warranty.is_expiring_soon
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Coverage Scope */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Coverage Scope & Policy Terms
              </h3>
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-normal">
                {warranty.coverage_details || 'Standard manufacturer terms apply. No additional coverage stipulations recorded.'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Covered Product Card & Attached Documents (xl:col-span-5) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Covered Hardware Asset Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Linked Hardware Asset
                </h3>
                <Link
                  to={`/products/${warranty.product_id}`}
                  className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors block truncate"
                >
                  {warranty.product_name}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Brand</span>
                <span className="font-bold text-slate-800">{warranty.product_brand || '—'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Category</span>
                <span className="font-bold text-slate-800">{warranty.category_name || 'General'}</span>
              </div>
            </div>

            <Link
              to={`/products/${warranty.product_id}`}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors border border-brand-200/60"
            >
              <span>View Product Detail Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Attached Warranty Policy Documents */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">Certificate Documents ({documents.length})</h3>
              </div>
            </div>

            {documents.length > 0 ? (
              <div className="space-y-2.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{doc.file_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{formatFileSize(doc.file_size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <a
                        href={`/api/documents/warranties/${doc.id}/download?token=${localStorage.getItem('token')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-600 hover:text-brand-600 rounded-lg hover:bg-white transition-colors"
                        title="Download / View"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
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
                onUpload={handleUploadDocument}
                label="Attach Certificate File"
                helperText="Upload official policy PDF or image (Max 10MB)"
                buttonLabel="Select Document"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Warranty Policy"
        message={`Are you sure you want to permanently delete the warranty provided by "${warranty.provider}"? Attached certificate documents will also be removed.`}
        confirmText="Yes, Delete Warranty"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
