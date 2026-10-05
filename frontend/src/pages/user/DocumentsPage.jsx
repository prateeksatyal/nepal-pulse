import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Shield,
  Download,
  Trash2,
  Filter,
  ExternalLink,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Package,
  Calendar,
  HardDrive,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchBar from '../../components/forms/SearchBar';
import { formatDate, formatFileSize } from '../../utils/dateUtils';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'receipt', 'warranty_doc'
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      if (docToDelete.doc_type === 'receipt') {
        await axiosClient.delete(`/documents/receipts/${docToDelete.id}`);
      } else {
        await axiosClient.delete(`/documents/warranties/${docToDelete.id}`);
      }
      setDeleteModalOpen(false);
      setDocToDelete(null);
      fetchDocuments();
    } catch (err) {
      alert('Failed to delete document.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      const matchesType = filterType === 'all' || d.doc_type === filterType;
      const matchesSearch =
        !search ||
        d.file_name.toLowerCase().includes(search.toLowerCase()) ||
        (d.product_name && d.product_name.toLowerCase().includes(search.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [documents, filterType, search]);

  const receiptCount = documents.filter((d) => d.doc_type === 'receipt').length;
  const warrantyDocCount = documents.filter((d) => d.doc_type === 'warranty_doc').length;
  const totalBytes = documents.reduce((acc, d) => acc + (d.file_size || 0), 0);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60">
              <FileCheck className="w-3.5 h-3.5 text-brand-600" />
              Secure Document Vault
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Documents & Receipts
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Centralized private cloud storage for all purchase invoices, proof-of-purchase receipts, and warranty registration cards.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 transform hover:-translate-y-0.5"
        >
          <Package className="w-4 h-4" />
          <span>Select Product to Upload</span>
        </Link>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Files Stored
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{documents.length}</span>
            <span className="text-xs font-semibold text-slate-500">Documents</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Purchase Receipts
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{receiptCount}</span>
            <span className="text-xs font-semibold text-blue-600">Invoices & Receipts</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Warranty Cards
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{warrantyDocCount}</span>
            <span className="text-xs font-semibold text-emerald-600">Policies & Cards</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Storage Vault
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{formatFileSize(totalBytes)}</span>
            <span className="text-xs font-semibold text-purple-600">Private & Secure</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:max-w-md">
          <SearchBar
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder="Search by file name or associated product..."
          />
        </div>

        {/* Filter Pills & View Switcher */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full md:w-auto">
          {/* Pills */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              All Files ({documents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('receipt')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'receipt'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Receipts ({receiptCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('warranty_doc')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'warranty_doc'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Warranty Cards ({warrantyDocCount})
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner label="Loading document files..." />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          title="No documents found"
          description={
            search
              ? 'No documents match your search criteria.'
              : "You haven't uploaded any documents in this category yet. Upload purchase receipts or warranty cards from any product detail page."
          }
          icon={FileText}
          actionButton={
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Browse Products to Upload</span>
            </Link>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDocs.map((doc) => {
            const isReceipt = doc.doc_type === 'receipt';
            const token = localStorage.getItem('token');
            const downloadUrl = isReceipt
              ? `/api/documents/receipts/${doc.id}/download?token=${token}`
              : `/api/documents/warranties/${doc.id}/download?token=${token}`;

            return (
              <div
                key={`${doc.doc_type}-${doc.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isReceipt
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}
                    >
                      {isReceipt ? (
                        <>
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Purchase Receipt</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Warranty Document</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                      {formatFileSize(doc.file_size)}
                    </span>
                  </div>

                  <h3
                    className="font-bold text-slate-900 text-sm truncate mb-1.5 group-hover:text-brand-600 transition-colors"
                    title={doc.file_name}
                  >
                    {doc.file_name}
                  </h3>

                  <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                    <span>Product:</span>
                    <Link
                      to={`/products/${doc.product_id}`}
                      className="font-semibold text-slate-800 hover:text-brand-600 inline-flex items-center gap-1 truncate max-w-[170px]"
                    >
                      <span>{doc.product_name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-brand-600" />
                    </Link>
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 py-2 border-t border-slate-100">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Uploaded: {formatDate(doc.uploaded_at)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-600" />
                    <span>Download / View</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteClick(doc)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Document Name</th>
                  <th className="py-3.5 px-4">Document Type</th>
                  <th className="py-3.5 px-4">Associated Product</th>
                  <th className="py-3.5 px-4">File Size</th>
                  <th className="py-3.5 px-4">Upload Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDocs.map((doc) => {
                  const isReceipt = doc.doc_type === 'receipt';
                  const token = localStorage.getItem('token');
                  const downloadUrl = isReceipt
                    ? `/api/documents/receipts/${doc.id}/download?token=${token}`
                    : `/api/documents/warranties/${doc.id}/download?token=${token}`;

                  return (
                    <tr key={`${doc.doc_type}-${doc.id}`} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isReceipt ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {isReceipt ? <FileText className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block truncate max-w-xs">{doc.file_name}</span>
                            <span className="text-xs text-slate-400">PDF / Image Document</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isReceipt
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}
                        >
                          {isReceipt ? 'Purchase Receipt' : 'Warranty Document'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <Link
                          to={`/products/${doc.product_id}`}
                          className="font-semibold text-slate-800 hover:text-brand-600 inline-flex items-center gap-1 group-hover:underline text-xs"
                        >
                          <span>{doc.product_name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>

                      <td className="py-4 px-4 text-xs font-mono text-slate-500">
                        {formatFileSize(doc.file_size)}
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-600">
                        {formatDate(doc.uploaded_at)}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(doc)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title={`Delete ${docToDelete?.doc_type === 'receipt' ? 'Receipt' : 'Warranty Document'}`}
        message={`Are you sure you want to permanently delete "${docToDelete?.file_name}"? This file will be removed from your cloud storage vault.`}
        confirmText="Yes, Delete File"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
