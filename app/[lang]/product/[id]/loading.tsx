export default function Loading() {
  return (
    <div className="container mx-auto px-4 text-text-light dark:text-text-lightdark">
      {/* Desktop title */}
      <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-2/3 md:block hidden p-4 mb-2" />

      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        {/* Image Gallery - Left Side */}
        <div className="flex-1 max-w-[800px] order-1 lg:order-1">
          <div className="flex gap-4">
            {/* Thumbnails - Desktop Only */}
            <div className="w-24 hidden md:flex flex-col space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                />
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1">
              <div className="aspect-square w-full max-h-[500px] rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Mobile title */}
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-3/4 md:hidden block order-2 lg:order-2" />

        {/* Product Info - Right Sidebar */}
        <div className="order-3 lg:order-3 lg:min-w-[320px] lg:max-w-sm lg:sticky lg:top-24 lg:self-start lg:h-fit space-y-6">
          {/* Brand */}
          <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-32" />

          {/* Price */}
          <div className="space-y-2">
            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-40" />
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-28" />
          </div>

          {/* Stock Badge */}
          <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse w-36" />

          {/* Badges (Discount, New, etc) */}
          <div className="flex gap-2">
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse w-16" />
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse w-20" />
          </div>

          {/* Add to Cart Buttons */}
          <div className="space-y-3">
            <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          </div>

          {/* Additional Info */}
          <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-4/6" />
          </div>
        </div>

        {/* Description - Below images on desktop */}
        <div className="order-4 lg:order-2 flex md:items-start place-items-start">
          <div className="max-w-md mx-auto md:ml-5 space-y-3 w-full">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-11/12" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-10/12" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-9/12" />
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <div className="my-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-pulse" />
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-40" />
        </div>

        {/* Specifications Card - Matching actual design */}
        <div className="max-w-3xl">
          <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 to-card backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="divide-y divide-border/30">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`p-5 transition-colors duration-200 ${
                    i % 2 === 0 ? 'bg-muted/10' : ''
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] items-center gap-4">
                    {/* Facet Name */}
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
                      <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-24" />
                    </div>

                    {/* Facet Values */}
                    <div className="flex flex-wrap justify-around gap-2 w-full">
                      {[...Array(3)].map((_, j) => (
                        <div
                          key={j}
                          className="flex-1 min-w-[96px] h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
