import type { BundlePromoData, Locale } from "@/types/tenant";

import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { t, tOpt } from "@/lib/i18n";

interface BundlePromoProps {
  data: BundlePromoData;
  locale: Locale;
}

export default function BundlePromo({ data, locale }: BundlePromoProps) {
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-4">
            <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              Special Bundle Deals
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t(data.title, locale)}
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t(data.description, locale)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {data.bundles.map((bundle, idx) => (
            <div
              key={idx}
              className="border-2 border-purple-200 dark:border-purple-800 rounded-xl overflow-hidden hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300"
            >
              <div className="bg-purple-50 dark:bg-purple-950/20 p-4 border-b border-purple-200 dark:border-purple-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t(bundle.name, locale)}
                </h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {bundle.products.map((product, productIdx) => (
                    <div
                      key={productIdx}
                      className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900"
                    >
                      <Image
                        fill
                        alt={t(product.name, locale)}
                        className="object-cover"
                        src={product.image}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4">
                  {bundle.products.map((product, productIdx) => (
                    <p
                      key={productIdx}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      • {t(product.name, locale)}
                    </p>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      ${bundle.price}
                    </span>
                    {bundle.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ${bundle.originalPrice}
                      </span>
                    )}
                  </div>

                  {bundle.savings && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-4">
                      {tOpt(bundle.savings, locale)}
                    </p>
                  )}

                  <Button asChild className="w-full">
                    <Link href={bundle.href}>Add Bundle to Cart</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}