import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  loading = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-sm max-w-md w-full p-6 border border-[#D9DEDA]">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${
              isDestructive
                ? 'bg-[#FDECEC] text-[#B42318] border border-[#B42318]/20'
                : 'bg-[#EAF6F5] text-[#0F6B68] border border-[#0F6B68]/20'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
          </div>

          <div className="flex-1 pt-0.5">
            <h3 className="text-sm font-bold text-[#101827] tracking-tight mb-1">{title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">{message}</p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#D9DEDA] hover:bg-[#F1F3F1] rounded-md transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-md transition-colors disabled:opacity-50 ${
                  isDestructive
                    ? 'bg-[#B42318] hover:bg-[#991B1B]'
                    : 'bg-[#0F6B68] hover:bg-[#0B5754]'
                }`}
              >
                {loading ? 'Processing...' : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
