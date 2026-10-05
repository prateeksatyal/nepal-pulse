import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 bg-[#F1F3F1] border-t border-[#D9DEDA]">
      <div className="text-xs text-[#4B5563] font-medium">
        Showing <span className="font-semibold text-[#111827]">{startItem}</span>–<span className="font-semibold text-[#111827]">{endItem}</span> of{' '}
        <span className="font-semibold text-[#111827]">{totalItems}</span> entries
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md border border-[#D9DEDA] bg-white text-slate-600 hover:bg-[#F7F7F4] hover:text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <span className="px-2.5 py-1 text-xs font-medium text-[#111827] bg-white border border-[#D9DEDA] rounded-md">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md border border-[#D9DEDA] bg-white text-slate-600 hover:bg-[#F7F7F4] hover:text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
