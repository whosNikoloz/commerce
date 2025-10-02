import type { ProductRailData, Locale } from "@/types/tenant";
import { t, tOpt } from "@/lib/i18n";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductRailBestRatedProps {
  data: ProductRailData;
  locale: Locale;
}

export default function ProductRailBestRated({
  data,
  locale,
}: ProductRailBestRatedProps) {
  return (
    <section className="py-16 bg-purple-50 dark:bg-purple-950/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t(data.title, locale)}
            </h2>
            {data.subtitle && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {tOpt(data.subtitle, locale)}
              </p>
            )}
          </div>

          <Button variant="ghost" asChild>
            <Link href={data.viewAllHref} className="flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Placeholder for actual product fetching */}
          {Array.from({ length: data.limit }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-950 rounded-lg p-4 shadow-md animate-pulse"
            >
              <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24" />
            </div>
          ))}
        </div>

        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          Products from category: {data.category}
        </div>
      </div>
    </section>
  );
}