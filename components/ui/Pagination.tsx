"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 py-8">
      <Button
        aria-label="Previous page"
        className="h-9 w-9 p-0"
        disabled={currentPage === 1}
        size="sm"
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-9 items-center justify-center text-muted-foreground"
              >
                ...
              </span>
            );
          }

          const isActive = currentPage === page;

          return (
            <Button
              key={page}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Page ${page}`}
              className={`h-9 w-9 p-0 ${isActive ? "" : ""}`}
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        aria-label="Next page"
        className="h-9 w-9 p-0"
        disabled={currentPage === totalPages}
        size="sm"
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
