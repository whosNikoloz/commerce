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
    <div className="flex items-center justify-center gap-2 lg:gap-3 mt-8 lg:mt-10 py-6">
      <Button
        className="px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl border-2 border-border/50 bg-card hover:border-brand-primary hover:bg-brand-primary hover:text-white text-foreground disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border/50 disabled:hover:bg-card disabled:hover:text-foreground font-semibold shadow-md hover:shadow-lg hover:shadow-brand-primary/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
        disabled={currentPage === 1}
        size="sm"
        variant="outline"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        <span className="text-lg lg:text-xl">←</span>
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </Button>

      <div className="flex items-center gap-1.5 lg:gap-2">
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
                className={`min-w-[2.5rem] lg:min-w-[3rem] h-10 lg:h-12 rounded-xl font-semibold shadow-md transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-brand-primary to-brand-primary/90 text-white border-2 border-brand-primary shadow-lg shadow-brand-primary/30 scale-110"
                    : "border-2 border-border/50 hover:border-brand-primary/50 hover:bg-brand-primary/5 hover:scale-105"
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
              <span key={page} className="px-2 lg:px-3 text-muted-foreground font-bold text-lg">
                ···
              </span>
            );
          }

          return null;
        })}
      </div>

      <Button
        className="px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl border-2 border-border/50 bg-card hover:border-brand-primary hover:bg-brand-primary hover:text-white text-foreground disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border/50 disabled:hover:bg-card disabled:hover:text-foreground font-semibold shadow-md hover:shadow-lg hover:shadow-brand-primary/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
        disabled={currentPage === totalPages}
        size="sm"
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">Next</span>
        <span className="text-lg lg:text-xl">→</span>
      </Button>
    </div>
  );
}
