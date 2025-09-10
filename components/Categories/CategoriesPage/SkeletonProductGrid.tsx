import { SkeletonProductCard } from "./SkeletonProductCard";

import { useIsMobile } from "@/hooks/use-mobile";

export function SkeletonProductGrid({ count = 12 }: { count?: number }) {
  const isMobile = useIsMobile();
  const viewMode: "grid" | "list" = isMobile ? "list" : "grid";

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
          : "space-y-4"
      }
      role="list"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}
