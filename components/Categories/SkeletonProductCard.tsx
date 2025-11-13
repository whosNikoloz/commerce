type SkeletonProps = { viewMode: "grid" | "list" };

export function SkeletonProductCard({ viewMode }: SkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="animate-pulse flex items-center gap-2 sm:gap-3 md:gap-4 w-full p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-card border border-border/40 shadow-sm">
        {/* Image skeleton */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 flex-shrink-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/50 to-muted/30" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          <div className="h-2.5 sm:h-3 w-16 sm:w-24 rounded-md bg-muted/40" />
          <div className="space-y-1">
            <div className="h-3 sm:h-4 w-full rounded-md bg-muted/50" />
            <div className="h-3 sm:h-4 w-3/4 rounded-md bg-muted/50" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
            <div className="h-5 sm:h-6 w-16 sm:w-20 rounded-md bg-muted/50" />
            <div className="h-3 sm:h-4 w-12 sm:w-14 rounded-md bg-muted/30" />
          </div>
          <div className="h-2.5 sm:h-3 w-12 sm:w-16 rounded-full bg-muted/40" />
        </div>

        {/* Button skeleton */}
        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/50 to-muted/30" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl sm:rounded-2xl bg-card border border-border/40 shadow-sm">
      <div className="animate-pulse">
        {/* Image skeleton */}
        <div className="w-full aspect-square bg-gradient-to-br from-muted/50 to-muted/30" />

        {/* Content skeleton */}
        <div className="p-2 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2">
          {/* Meta line */}
          <div className="h-2.5 sm:h-3 w-16 sm:w-20 rounded-md bg-muted/40" />

          {/* Title */}
          <div className="space-y-1 min-h-[2rem] sm:min-h-[2.5rem]">
            <div className="h-3 sm:h-4 w-full rounded-md bg-muted/50" />
            <div className="h-3 sm:h-4 w-3/4 rounded-md bg-muted/50" />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
            <div className="h-6 sm:h-7 w-20 sm:w-24 rounded-md bg-muted/50" />
            <div className="h-3 sm:h-4 w-12 sm:w-16 rounded-md bg-muted/30" />
          </div>

          {/* Stock indicator */}
          <div className="h-2.5 sm:h-3 w-12 sm:w-16 rounded-full bg-muted/40" />

          {/* Button */}
          <div className="h-8 sm:h-9 md:h-10 w-full rounded-lg sm:rounded-xl bg-gradient-to-r from-muted/50 to-muted/40 mt-1 sm:mt-2" />
        </div>
      </div>
    </div>
  );
}
