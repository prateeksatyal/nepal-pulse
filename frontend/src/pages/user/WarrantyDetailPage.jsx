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
    return <LoadingSpinner label="Loading warranty details..." />;
  }

  if (error || !warranty) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Warranty Record Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">{error || 'Unable to locate this record.'}</p>
        <Link
          to="/warranties"
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700"
        >
          Return to Warranties
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/warranties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Warranties</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSendReminder}
            disabled={sendingReminder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg border border-brand-200 transition-colors disabled:opacity-50"
          >
            <Mail className="w-3.5 h-3.5 text-brand-600" />
            <span>{sendingReminder ? 'Sending...' : 'Send Expiry Notice'}</span>
          </button>
          <Link
            to={`/warranties/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Warranty</span>
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

      {reminderResult && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{reminderResult.message}</span>
          </div>
          {reminderResult.previewUrl && (
            <a
              href={reminderResult.previewUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold underline text-brand-700 ml-2"
            >
              Open Ethereal Email Preview &rarr;
            </a>
          )}
        </div>
      )}

      {/* Main Warranty Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                {warranty.warranty_type}
              </span>
              <StatusBadge status={warranty.status} daysRemaining={warranty.days_remaining} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{warranty.provider}</h1>
            <p className="text-sm text-slate-600 mt-1">
              Covered Product:{' '}
              <Link
                to={`/products/${warranty.product_id}`}
                className="font-semibold text-brand-600 hover:underline inline-flex items-center gap-1"
              >
                {warranty.product_name}
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Days Remaining</span>
            <span className="text-3xl font-extrabold text-slate-900">
              {warranty.days_remaining !== null && warranty.days_remaining !== undefined
                ? `${warranty.days_remaining} d`
                : 'N/A'}
            </span>
          </div>
        </div>

        {/* Visual Progress / Expiry Timeline Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Started: {formatDate(warranty.start_date)}</span>
            <span className="font-semibold text-slate-800">
              {warranty.is_expired
                ? 'Expired'
                : `${100 - progressPercent}% Term Remaining`}
            </span>
            <span>Expires: {formatDate(warranty.end_date)}</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
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

        {/* Coverage Details */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Coverage Details & Scope
          </h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
            {warranty.coverage_details || (
              <span className="italic text-slate-400">No specific coverage terms entered.</span>
            )}
          </div>
        </div>
      </div>

      {/* Attached Warranty Documents Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">
              Attached Warranty Cards & Certificates
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {documents.length} Document(s)
          </span>
        </div>

        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-800 truncate">{doc.file_name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(doc.file_size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`/api/documents/warranties/${doc.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-600 hover:text-brand-600 rounded-lg hover:bg-white transition-colors"
                    title="Download document"
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
          <p className="text-xs text-slate-400 italic py-2">
            No warranty cards or certificates uploaded for this warranty yet.
          </p>
        )}

        <div className="pt-2">
          <FileUpload
            onUpload={handleUploadDocument}
            label="Upload Warranty Certificate / Card"
            helperText="Upload official policy paper, extended card, or invoice (PDF, JPG, PNG - Max 5MB)"
            buttonLabel="Select Document"
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Warranty"
        message="Are you sure you want to delete this warranty record? Product information will be preserved."
        confirmText="Yes, Delete Warranty"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
