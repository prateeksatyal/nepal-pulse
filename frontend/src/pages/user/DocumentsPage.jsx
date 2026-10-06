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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DEDA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA]">
              <FileCheck className="w-3.5 h-3.5 text-[#0F6B68]" />
              Documents
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101827] tracking-tight mt-1.5">
            Documents & Receipts
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-3xl">
            Manage your invoices, receipts, and warranty documents in one place.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0F6B68] hover:bg-[#0B5754] text-white text-xs font-semibold rounded-md transition-colors"
        >
          <Package className="w-4 h-4" />
          <span>Upload From Products</span>
        </Link>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Total Files Stored
            </span>
            <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#101827]">{documents.length}</span>
            <span className="text-[11px] font-medium text-[#6B7280]">Documents</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Purchase Receipts
            </span>
            <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#101827]">{receiptCount}</span>
            <span className="text-[11px] font-medium text-[#6B7280]">Invoices & Receipts</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Warranty Cards
            </span>
            <div className="w-8 h-8 rounded-md bg-[#EAF6EC] text-[#15803D] border border-[#15803D]/20 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#101827]">{warrantyDocCount}</span>
            <span className="text-[11px] font-medium text-[#15803D]">Policies & Cards</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#D9DEDA] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Storage Vault
            </span>
            <div className="w-8 h-8 rounded-md bg-[#F1F3F1] text-[#0F6B68] border border-[#D9DEDA] flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#101827]">{formatFileSize(totalBytes)}</span>
            <span className="text-[11px] font-medium text-[#6B7280]">Encrypted Vault</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-3.5 rounded-lg border border-[#D9DEDA] flex flex-col md:flex-row items-center justify-between gap-4">
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
          <div className="flex items-center bg-[#F1F3F1] border border-[#D9DEDA] p-0.5 rounded-md text-xs font-medium text-[#4B5563]">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded transition-all ${
                filterType === 'all'
                  ? 'bg-white text-[#101827] font-semibold shadow-xs'
                  : 'hover:text-[#101827]'
              }`}
            >
              All Files ({documents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('receipt')}
              className={`px-3 py-1 rounded transition-all ${
                filterType === 'receipt'
                  ? 'bg-white text-[#101827] font-semibold shadow-xs'
                  : 'hover:text-[#101827]'
              }`}
            >
              Receipts ({receiptCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('warranty_doc')}
              className={`px-3 py-1 rounded transition-all ${
                filterType === 'warranty_doc'
                  ? 'bg-white text-[#101827] font-semibold shadow-xs'
                  : 'hover:text-[#101827]'
              }`}
            >
              Warranty Cards ({warrantyDocCount})
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-[#F1F3F1] border border-[#D9DEDA] p-0.5 rounded-md">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#0F6B68] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#101827]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1 rounded transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#0F6B68] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#101827]'
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
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F6B68] hover:bg-[#0B5754] text-white text-xs font-semibold rounded-md transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Browse Products to Upload</span>
            </Link>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => {
            const isReceipt = doc.doc_type === 'receipt';
            const token = localStorage.getItem('token');
            const downloadUrl = isReceipt
              ? `/api/documents/receipts/${doc.id}/download?token=${token}`
              : `/api/documents/warranties/${doc.id}/download?token=${token}`;

            return (
              <div
                key={`${doc.doc_type}-${doc.id}`}
                className="bg-white rounded-lg border border-[#D9DEDA] p-4 hover:border-[#0F6B68]/50 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F3F1] text-[#111827] border border-[#D9DEDA]">
                      {isReceipt ? (
                        <>
                          <FileText className="w-3 h-3 text-[#0F6B68]" />
                          <span>Receipt</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-3 h-3 text-[#15803D]" />
                          <span>Warranty Doc</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-[#6B7280] font-mono bg-[#F1F3F1] px-1.5 py-0.5 rounded border border-[#D9DEDA]">
                      {formatFileSize(doc.file_size)}
                    </span>
                  </div>

                  <h3
                    className="font-semibold text-[#101827] text-xs truncate mb-1.5 group-hover:text-[#0F6B68] transition-colors"
                    title={doc.file_name}
                  >
                    {doc.file_name}
                  </h3>

                  <p className="text-[11px] text-[#6B7280] mb-3 flex items-center gap-1">
                    <span>Product:</span>
                    <Link
                      to={`/products/${doc.product_id}`}
                      className="font-medium text-[#111827] hover:text-[#0F6B68] inline-flex items-center gap-1 truncate max-w-[170px]"
                    >
                      <span>{doc.product_name}</span>
                      <ExternalLink className="w-3 h-3 text-[#6B7280] group-hover:text-[#0F6B68]" />
                    </Link>
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] py-2 border-t border-[#D9DEDA]">
                    <Calendar className="w-3 h-3 text-[#6B7280]" />
                    <span>Uploaded: {formatDate(doc.uploaded_at)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D9DEDA] flex items-center justify-between">
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F1F3F1] hover:bg-[#D9DEDA] text-[#101827] text-xs font-medium rounded-md border border-[#D9DEDA] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0F6B68]" />
                    <span>Download</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteClick(doc)}
                    className="p-1.5 text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#D9DEDA] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F1F3F1] border-b border-[#D9DEDA] text-[11px] font-semibold text-[#4B5563] uppercase tracking-wider">
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Associated Product</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DEDA] text-xs">
                {filteredDocs.map((doc) => {
                  const isReceipt = doc.doc_type === 'receipt';
                  const token = localStorage.getItem('token');
                  const downloadUrl = isReceipt
                    ? `/api/documents/receipts/${doc.id}/download?token=${token}`
                    : `/api/documents/warranties/${doc.id}/download?token=${token}`;

                  return (
                    <tr key={`${doc.doc_type}-${doc.id}`} className="hover:bg-[#F7F7F4] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs border border-[#D9DEDA] ${
                            isReceipt ? 'bg-[#F1F3F1] text-[#0F6B68]' : 'bg-[#EAF6EC] text-[#15803D]'
                          }`}>
                            {isReceipt ? <FileText className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="font-semibold text-[#101827] block truncate max-w-xs">{doc.file_name}</span>
                            <span className="text-[11px] text-[#6B7280]">Stored in Supabase Vault</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F3F1] text-[#111827] border border-[#D9DEDA]">
                          {isReceipt ? 'Purchase Receipt' : 'Warranty Document'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <Link
                          to={`/products/${doc.product_id}`}
                          className="font-medium text-[#111827] hover:text-[#0F6B68] inline-flex items-center gap-1 group-hover:underline text-xs"
                        >
                          <span>{doc.product_name}</span>
                          <ExternalLink className="w-3 h-3 text-[#6B7280]" />
                        </Link>
                      </td>

                      <td className="py-3 px-4 text-xs font-mono text-[#6B7280]">
                        {formatFileSize(doc.file_size)}
                      </td>

                      <td className="py-3 px-4 text-xs text-[#4B5563]">
                        {formatDate(doc.uploaded_at)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F1F3F1] hover:bg-[#D9DEDA] text-[#101827] text-xs font-medium rounded-md border border-[#D9DEDA] transition-colors"
                          >
                            <Download className="w-3 h-3 text-[#0F6B68]" />
                            <span>Download</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(doc)}
                            className="p-1 text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
