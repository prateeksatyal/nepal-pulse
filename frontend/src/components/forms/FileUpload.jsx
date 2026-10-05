import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { formatFileSize } from '../../utils/dateUtils';

export default function FileUpload({
  onUpload,
  label = 'Upload Document',
  helperText = 'Supported formats: PDF, JPG, JPEG, PNG (Max 10MB)',
  accept = '.pdf,.jpg,.jpeg,.png,image/png,image/jpeg,application/pdf',
  maxSizeMB = 10,
  buttonLabel = 'Select File',
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const inputRef = useRef(null);

  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];

  const validateFile = (file) => {
    setError('');
    setUploadSuccess(false);

    if (!file) return false;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError(`Invalid file type (.${ext}). Only PDF, JPG, JPEG, and PNG files are accepted.`);
      return false;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size (${formatFileSize(file.size)}) exceeds the maximum allowed limit of ${maxSizeMB}MB.`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleTriggerUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    try {
      await onUpload(selectedFile);
      setUploadSuccess(true);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setError('');
    setUploadSuccess(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          dragActive
            ? 'border-brand-500 bg-brand-50/60 ring-4 ring-brand-500/10'
            : 'border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={`file-upload-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />

        {!selectedFile ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2.5 border border-brand-100 shadow-xs">
              <UploadCloud className="w-6 h-6 stroke-[1.75]" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Drag & drop file here, or{' '}
              <label
                htmlFor={`file-upload-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
                className="text-brand-600 hover:text-brand-700 cursor-pointer font-bold underline underline-offset-2"
              >
                {buttonLabel}
              </label>
            </p>
            <p className="text-[11px] text-slate-500">{helperText}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-3 overflow-hidden text-left">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 border border-brand-100">
                <File className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="truncate">
                <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTriggerUpload}
                disabled={uploading}
                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Confirm Upload'}
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={uploading}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-2.5 text-xs font-medium text-rose-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-emerald-600">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>File uploaded successfully!</span>
        </div>
      )}
    </div>
  );
}
