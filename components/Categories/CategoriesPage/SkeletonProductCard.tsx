type SkeletonProps = { viewMode: "grid" | "list" };

export function SkeletonProductCard({ viewMode }: SkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="animate-pulse flex items-center w-full rounded-2xl bg-brand-surface dark:bg-brand-surfacedark text-text-light dark:text-text-lightdark p-4 border border-brand-muted dark:border-brand-muteddark shadow-sm">
        <div className="w-[100px] h-[100px] md:w-[160px] md:h-[140px] rounded-xl bg-brand-muted/40 dark:bg-brand-muteddark/40 shrink-0" />
        <div className="flex-1 px-4 space-y-2">
          <div className="h-4 w-2/3 rounded bg-brand-muted/40 dark:bg-brand-muteddark/40" />
          <div className="h-3 w-1/2 rounded bg-brand-muted/30 dark:bg-brand-muteddark/30" />
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 rounded bg-brand-muted/40 dark:bg-brand-muteddark/40" />
            <div className="h-4 w-14 rounded bg-brand-muted/30 dark:bg-brand-muteddark/30" />
          </div>
        </div>

        <div className="h-11 w-11 rounded-xl bg-brand-muted/40 dark:bg-brand-muteddark/40" />
      </div>
    );
  }

  return (
    <div className="group bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark rounded-2xl shadow-sm p-3 lg:p-4">
      <div className="animate-pulse">
        <div className="w-full aspect-square rounded-md bg-brand-muted/40 dark:bg-brand-muteddark/40" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-3/4 rounded bg-brand-muted/40 dark:bg-brand-muteddark/40" />
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 rounded bg-brand-muted/40 dark:bg-brand-muteddark/40" />
            <div className="h-4 w-12 rounded bg-brand-muted/30 dark:bg-brand-muteddark/30" />
          </div>
          <div className="h-3 w-32 rounded bg-brand-muted/30 dark:bg-brand-muteddark/30" />
          <div className="h-9 w-full rounded bg-brand-muted/40 dark:bg-brand-muteddark/40" />
          <div className="h-9 w-1/2 rounded bg-brand-muted/30 dark:bg-brand-muteddark/30" />
        </div>
      </div>
    </div>
  );
}
