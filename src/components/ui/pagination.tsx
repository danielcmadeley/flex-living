"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPages?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPages = 5,
  className,
}: PaginationProps) {
  // Calculate page range to show
  const getPageRange = () => {
    const delta = Math.floor(showPages / 2);
    let start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, start + showPages - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    return { start, end };
  };

  const { start, end } = getPageRange();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={cn("flex items-center justify-between", className)}>
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
          currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {/* First page */}
        {start > 1 && (
          <>
            <PageButton
              page={1}
              isActive={currentPage === 1}
              onClick={() => onPageChange(1)}
            />
            {start > 2 && <Ellipsis />}
          </>
        )}

        {/* Page range */}
        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
          (page) => (
            <PageButton
              key={page}
              page={page}
              isActive={currentPage === page}
              onClick={() => onPageChange(page)}
            />
          ),
        )}

        {/* Last page */}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <Ellipsis />}
            <PageButton
              page={totalPages}
              isActive={currentPage === totalPages}
              onClick={() => onPageChange(totalPages)}
            />
          </>
        )}
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
          currentPage === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
        )}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

interface PageButtonProps {
  page: number;
  isActive: boolean;
  onClick: () => void;
}

function PageButton({ page, isActive, onClick }: PageButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-blue-600 text-white"
          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
      )}
    >
      {page}
    </button>
  );
}

function Ellipsis() {
  return (
    <div className="px-2 py-2">
      <MoreHorizontal className="h-4 w-4 text-gray-400" />
    </div>
  );
}

// Utility component for showing pagination info
interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  totalItems,
  itemsPerPage,
  className,
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn("text-sm text-gray-600", className)}>
      Showing {startItem}-{endItem} of {totalItems} results
    </div>
  );
}

// Hook for pagination logic
export function usePagination({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1,
}: {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset to first page if totalItems changes significantly
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNext = () => goToPage(currentPage + 1);
  const goToPrevious = () => goToPage(currentPage - 1);
  const goToFirst = () => goToPage(1);
  const goToLast = () => goToPage(totalPages);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
  };
}
