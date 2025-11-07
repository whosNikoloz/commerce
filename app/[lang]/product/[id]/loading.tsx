export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />

          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-3/4" />
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-1/2" />
          </div>

          <div className="space-y-2">
            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-1/3" />
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-1/4" />
          </div>

          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-1/3" />

          <div className="space-y-2">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-3/4" />
          </div>

          <div className="space-y-3">
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-24" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-12 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-2/3" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-1/3" />
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <div className="flex gap-4 border-b">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-t animate-pulse"
            />
          ))}
        </div>

        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"
              style={{ width: `${Math.random() * 30 + 60}%` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-16 space-y-6">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-3/4" />
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
