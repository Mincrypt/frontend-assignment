'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  disabled = false,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Calculate item range e.g. "Showing 21–40 of 194"
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate pagination range with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, safeCurrentPage - 1);
      let end = Math.min(totalPages - 1, safeCurrentPage + 1);

      if (safeCurrentPage <= 3) {
        start = 2;
        end = 4;
      } else if (safeCurrentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-slate-800 text-sm">
      {/* Items Range & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs sm:text-sm">
        <span>
          Showing <strong className="text-slate-200 font-semibold">{formatNumber(startItem)}</strong>–
          <strong className="text-slate-200 font-semibold">{formatNumber(endItem)}</strong> of{' '}
          <strong className="text-slate-200 font-semibold">{formatNumber(totalItems)}</strong> products
        </span>

        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
          <label htmlFor="page-size-select" className="text-xs text-slate-400 whitespace-nowrap">
            Per page:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={disabled}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer disabled:opacity-50"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-slate-900 text-slate-100">
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1 || disabled}
          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:text-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1">
          {pages.map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-500 select-none">
                  •••
                </span>
              );
            }

            const pageNum = Number(page);
            const isActive = pageNum === safeCurrentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                disabled={disabled}
                className={`min-w-[34px] h-[34px] px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold border border-indigo-500'
                    : 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800'
                } disabled:opacity-50`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${pageNum}`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages || disabled}
          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:text-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
