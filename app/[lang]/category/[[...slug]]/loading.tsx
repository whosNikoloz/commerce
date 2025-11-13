"use client";

import { useMemo } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/* ------------------------------
   Tiny building blocks (skeletons)
--------------------------------- */

function PulseBox(props: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-gray-300/40 dark:bg-gray-600/40", props.className)} />;
}

function GradientPulse(props: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-gradient-to-br from-muted/50 to-muted/30 dark:from-slate-700/40 dark:to-slate-600/40",
        props.className
      )}
    />
  );
}

function FilterSidebarSkeleton() {
  return (
    <aside className="hidden lg:block bg-card sticky top-6 h-fit max-h-[calc(100vh-3rem)] overflow-y-auto border rounded-lg p-6 shadow-sm">
      <div className="space-y-6">
        {/* Title + quick toggles */}
        <div>
          <PulseBox className="h-5 w-32" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <PulseBox className="h-4 w-40" />
                <PulseBox className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>

        {/* Facet groups */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <PulseBox className="h-5 w-28" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((__, j) => (
                <PulseBox key={j} className="h-4 w-48" />
              ))}
            </div>
          </div>
        ))}

        <PulseBox className="h-9 w-full" />
      </div>
    </aside>
  );
}

function ToolbarSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <PulseBox className="h-6 w-40" />
        <PulseBox className="h-4 w-28" />
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        <PulseBox className="h-9 w-36" />
        <div className="flex">
          <PulseBox className="h-9 w-10 rounded-l-md" />
          <PulseBox className="h-9 w-10 rounded-r-md" />
        </div>
        <PulseBox className="h-6 w-8" />
      </div>
    </div>
  );
}

function ChipsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <PulseBox key={i} className="h-6 w-24" />
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl sm:rounded-2xl bg-card border border-border/40 shadow-sm">
      <div>
        {/* image */}
        <GradientPulse className="w-full aspect-square" />
        {/* content */}
        <div className="p-2 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2">
          {/* meta */}
          <PulseBox className="h-2.5 sm:h-3 w-16 sm:w-20" />
          {/* title */}
          <div className="space-y-1 min-h-[2rem] sm:min-h-[2.5rem]">
            <PulseBox className="h-3 sm:h-4 w-full" />
            <PulseBox className="h-3 sm:h-4 w-3/4" />
          </div>
          {/* price line */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
            <PulseBox className="h-6 sm:h-7 w-20 sm:w-24" />
            <PulseBox className="h-3 sm:h-4 w-12 sm:w-16" />
          </div>
          {/* stock/label */}
          <PulseBox className="h-2.5 sm:h-3 w-12 sm:w-16 rounded-full" />
          {/* button */}
          <GradientPulse className="h-8 sm:h-9 md:h-10 w-full rounded-lg sm:rounded-xl mt-1 sm:mt-2" />
        </div>
      </div>
    </div>
  );
}

function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div
      className={cn(
        // EXACT SAME LAYOUT AS REAL GRID:
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6",
        // ensure items stretch (no right-side stacking)
        "justify-items-stretch items-stretch w-full"
      )}
      role="list"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2">
      <PulseBox className="h-9 w-20" />
      {Array.from({ length: 5 }).map((_, i) => (
        <PulseBox key={i} className="h-9 w-9" />
      ))}
      <PulseBox className="h-9 w-20" />
    </div>
  );
}

/* ------------------------------
   PAGE LOADING (final export)
--------------------------------- */

export default function Loading() {
  const isMobile = useIsMobile();
  const cardCount = useMemo(() => (isMobile ? 8 : 12), [isMobile]);

  return (
    <div className={cn("min-h-screen", !isMobile && "mt-16")}>
      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div
          className={cn(
            // desktop two-column layout (left filters, right content)
            "grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-8"
          )}
        >
          {/* Left: sticky filters (desktop only) */}
          <FilterSidebarSkeleton />

          {/* Right: content — min-w-0 so grid can use full width */}
          <div className="min-w-0 space-y-4 lg:space-y-6">
            <ToolbarSkeleton />
            <ChipsSkeleton />

            {/* PRODUCTS: exact same grid/gaps/cols as the real page */}
            <ProductGridSkeleton count={cardCount} />

            <PaginationSkeleton />
          </div>
        </div>

        {/* Mobile: “Show filters” button placeholder */}
        <div className="lg:hidden mt-4">
          <PulseBox className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
