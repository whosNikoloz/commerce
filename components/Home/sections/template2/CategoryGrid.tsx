import type { CategoryGridData, Locale } from "@/types/tenant";

import Link from "next/link";
import Image from "next/image";

import { t } from "@/lib/i18n";

interface CategoryGridProps {
  data: CategoryGridData;
  locale: Locale;
}

export default function CategoryGrid({ data, locale }: CategoryGridProps) {
  return (
    <section className="py-16 bg-emerald-50 dark:bg-emerald-950/10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          {t(data.title, locale)}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.categories.map((category, idx) => (
            <Link
              key={idx}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-900"
              href={category.href}
            >
              <div className="aspect-[4/5] relative">
                <Image
                  fill
                  alt={t(category.name, locale)}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  src={category.imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-1">
                  {t(category.name, locale)}
                </h3>
                {category.productCount && (
                  <p className="text-sm text-gray-200">
                    {category.productCount} items
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}