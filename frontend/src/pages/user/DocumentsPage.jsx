import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Download, Trash2, Filter, ExternalLink } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatFileSize } from '../../utils/dateUtils';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'receipt', 'warranty_doc'

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/documents');
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete ${doc.doc_type === 'receipt' ? 'receipt' : 'warranty document'} "${doc.file_name}"?`)) return;
    try {
      if (doc.doc_type === 'receipt') {
        await axiosClient.delete(`/documents/receipts/${doc.id}`);
      } else {
        await axiosClient.delete(`/documents/warranties/${doc.id}`);
      }
      fetchDocuments();
    } catch (err) {
      alert('Failed to delete document.');
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (filterType === 'all') return true;
    return d.doc_type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Documents Vault</h1>
          <p className="text-sm text-slate-500 mt-1">
            Central repository of all uploaded purchase receipts and warranty cards.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'all' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Files ({documents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('receipt')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'receipt' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Receipts ({documents.filter((d) => d.doc_type === 'receipt').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('warranty_doc')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'warranty_doc' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Warranty Cards ({documents.filter((d) => d.doc_type === 'warranty_doc').length})
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading document files..." />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          title="No documents found"
          description="You haven't uploaded any documents in this category yet. Upload purchase receipts or warranty cards from any product detail page."
          icon={FileText}
          actionButton={
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              Browse Products to Upload
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isReceipt = doc.doc_type === 'receipt';
            const token = localStorage.getItem('token');
            const downloadUrl = isReceipt
              ? `/api/documents/receipts/${doc.id}/download?token=${token}`
              : `/api/documents/warranties/${doc.id}/download?token=${token}`;

            return (
              <div
                key={`${doc.doc_type}-${doc.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isReceipt
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}
                    >
                      {isReceipt ? (
                        <>
                          <FileText className="w-3 h-3" />
                          <span>Purchase Receipt</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-3 h-3" />
                          <span>Warranty Document</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatFileSize(doc.file_size)}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm truncate mb-1" title={doc.file_name}>
                    {doc.file_name}
                  </h3>

                  <p className="text-xs text-slate-500 mb-3">
                    Product:{' '}
                    <Link
                      to={`/products/${doc.product_id}`}
                      className="font-semibold text-slate-800 hover:text-brand-600 inline-flex items-center gap-0.5"
                    >
                      {doc.product_name}
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </Link>
                  </p>

                  <div className="text-[11px] text-slate-400 py-2 border-t border-slate-100">
                    Uploaded: {formatDate(doc.uploaded_at)}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-600" />
                    <span>Download / View</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDelete(doc)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
