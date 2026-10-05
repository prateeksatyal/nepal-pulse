import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { formatFileSize } from '../../utils/dateUtils';

export default function FileUpload({
  onUpload,
  label = 'Upload Document',
  helperText = 'PDF, JPG, JPEG, PNG (Max 10MB)',
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
      setError(`Invalid file type (.${ext}). Accepted: PDF, JPG, JPEG, PNG.`);
      return false;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size (${formatFileSize(file.size)}) exceeds limit of ${maxSizeMB}MB.`);
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
      setError(err.response?.data?.message || err.message || 'Upload failed.');
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
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#101827]">{label}</label>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border border-dashed rounded-lg p-5 text-center transition-colors ${
          dragActive
            ? 'border-[#0F6B68] bg-[#EAF6F5]'
            : 'border-[#D9DEDA] bg-white hover:bg-[#F7F7F4]'
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
            <div className="w-9 h-9 rounded-md bg-[#F1F3F1] text-slate-600 flex items-center justify-center mx-auto mb-2 border border-[#D9DEDA]">
              <UploadCloud className="w-5 h-5 text-[#0F6B68]" />
            </div>
            <p className="text-xs font-medium text-[#111827] mb-0.5">
              Drag & drop file here, or{' '}
              <label
                htmlFor={`file-upload-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
                className="text-[#0F6B68] hover:text-[#0B5754] cursor-pointer font-semibold underline underline-offset-2"
              >
                {buttonLabel}
              </label>
            </p>
            <p className="text-[11px] text-slate-500">{helperText}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white p-3 rounded-md border border-[#D9DEDA]">
            <div className="flex items-center gap-2.5 overflow-hidden text-left">
              <div className="w-8 h-8 rounded-md bg-[#EAF6F5] text-[#0F6B68] flex items-center justify-center flex-shrink-0">
                <File className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-[#111827] truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTriggerUpload}
                disabled={uploading}
                className="px-3 py-1.5 bg-[#0F6B68] hover:bg-[#0B5754] text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={uploading}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                aria-label="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[#B42318]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[#15803D]">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>File uploaded successfully</span>
        </div>
      )}
    </div>
  );
}
