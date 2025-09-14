import { useEffect } from "react";

import { SkeletonProductCard } from "./SkeletonProductCard";

import { useIsMobile } from "@/hooks/use-mobile";

type ViewMode = "grid" | "list";

export function SkeletonProductGrid({
  count = 12,
  onViewModeChange,
}: {
  count?: number;
  onViewModeChange?: (mode: ViewMode) => void;
}) {
  const isMobile = useIsMobile();
  const viewMode: ViewMode = isMobile ? "list" : "grid";

  useEffect(() => {
    if (onViewModeChange) {
      onViewModeChange(viewMode);
    }
  }, [viewMode, onViewModeChange]);

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
          : "space-y-3 sm:space-y-4"
      }
      role="list"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}
