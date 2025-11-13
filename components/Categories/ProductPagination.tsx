"use client";

import { Button } from "@/components/ui/button";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ProductPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 lg:gap-2 mt-6 lg:mt-8 text-text-light dark:text-text-lightdark">
      <Button
        className="lg:size-default border-brand-muted dark:border-brand-muteddark"
        disabled={currentPage === 1}
        size="sm"
        variant="outline"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </Button>

      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;

        if (
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 1 && page <= currentPage + 1)
        ) {
          const isActive = currentPage === page;

          return (
            <Button
              key={page}
              className={`w-8 lg:w-10 ${
                isActive
                  ? "bg-brand-primary text-white"
                  : "border-brand-muted dark:border-brand-muteddark"
              }`}
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        } else if (page === currentPage - 2 || page === currentPage + 2) {
          return (
            <span key={page} className="px-1 lg:px-2 text-text-subtle dark:text-text-subtledark">
              …
            </span>
          );
        }

        return null;
      })}

      <Button
        className="lg:size-default border-brand-muted dark:border-brand-muteddark"
        disabled={currentPage === totalPages}
        size="sm"
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">Next</span>
      </Button>
    </div>
  );
}
