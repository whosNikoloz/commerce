type SkeletonProps = { viewMode: "grid" | "list" };

export function SkeletonProductCard({ viewMode }: SkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="animate-pulse flex items-center gap-3 sm:gap-4 w-full p-3 sm:p-4 rounded-2xl bg-card border border-border/40 shadow-md">
        {/* Image skeleton */}
        <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 flex-shrink-0 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3 w-24 rounded-md bg-muted/40" />
          <div className="space-y-1.5">
            <div className="h-4 w-full rounded-md bg-muted/50" />
            <div className="h-4 w-3/4 rounded-md bg-muted/50" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <div className="h-6 w-20 rounded-md bg-muted/50" />
            <div className="h-4 w-14 rounded-md bg-muted/30" />
          </div>
          <div className="h-3 w-16 rounded-full bg-muted/40" />
        </div>

        {/* Button skeleton */}
        <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card border border-border/40 shadow-lg">
      <div className="animate-pulse">
        {/* Image skeleton */}
        <div className="w-full aspect-square bg-gradient-to-br from-muted/50 to-muted/30" />

        {/* Content skeleton */}
        <div className="p-3 sm:p-4 space-y-2">
          {/* Meta line */}
          <div className="h-3 w-20 rounded-md bg-muted/40" />

          {/* Title */}
          <div className="space-y-1.5 min-h-[2.5rem]">
            <div className="h-4 w-full rounded-md bg-muted/50" />
            <div className="h-4 w-3/4 rounded-md bg-muted/50" />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1">
            <div className="h-7 w-24 rounded-md bg-muted/50" />
            <div className="h-4 w-16 rounded-md bg-muted/30" />
          </div>

          {/* Stock indicator */}
          <div className="h-3 w-16 rounded-full bg-muted/40" />

          {/* Button */}
          <div className="h-9 sm:h-10 w-full rounded-xl bg-gradient-to-r from-muted/50 to-muted/40 mt-2" />
        </div>
      </div>
    </div>
  );
}
