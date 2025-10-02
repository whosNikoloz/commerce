import type { CategoryGridData, Locale } from "@/types/tenant";
import { t } from "@/lib/i18n";
import Link from "next/link";
import Image from "next/image";

interface CategoryGridProps {
  data: CategoryGridData;
  locale: Locale;
}

export default function CategoryGrid({ data, locale }: CategoryGridProps) {
  return (
    <section className="py-16 bg-purple-50 dark:bg-purple-950/10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          {t(data.title, locale)}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.categories.map((category, idx) => (
            <Link
              key={idx}
              href={category.href}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-900"
            >
              <div className="aspect-square relative">
                <Image
                  src={category.imageUrl}
                  alt={t(category.name, locale)}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/30 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-1">
                  {t(category.name, locale)}
                </h3>
                {category.productCount && (
                  <p className="text-sm text-purple-200">
                    {category.productCount} products
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