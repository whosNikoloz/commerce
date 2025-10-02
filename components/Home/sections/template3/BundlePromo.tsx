import type { BundlePromoData, Locale } from "@/types/tenant";
import type { ProductResponseModel } from "@/types/product";

import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { t, tOpt } from "@/lib/i18n";
import { searchProductsByFilter } from "@/app/api/services/productService";

interface BundlePromoProps {
  data: BundlePromoData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default async function BundlePromo({ data, locale, template = 3 }: BundlePromoProps) {
  let products: ProductResponseModel[] = []

  try {
    // Fetch random products for bundles
    const result = await searchProductsByFilter({
      filter: {},
      pageSize: 9, // 3 products per bundle × 3 bundles
      page: 1,
      sortBy: "featured"
    })
    products = result.items || []
  } catch (e) {
    console.error("Failed to load bundle products:", e)
  }

  // Create bundles from fetched products (3 products per bundle)
  const bundles = []
  for (let i = 0; i < Math.min(3, Math.floor(products.length / 3)); i++) {
    const bundleProducts = products.slice(i * 3, (i * 3) + 3)
    const totalPrice = bundleProducts.reduce((sum, p) => sum + (p.discountPrice || p.price), 0)
    const bundlePrice = Math.round(totalPrice * 0.85) // 15% bundle discount

    bundles.push({
      name: `Bundle ${i + 1}`,
      products: bundleProducts,
      price: bundlePrice,
      originalPrice: totalPrice,
      savings: `Save $${totalPrice - bundlePrice}`
    })
  }
  return (
    <section className="py-16 bg-background dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-beauty-luxury/10 dark:bg-beauty-luxury/20 px-4 py-2 rounded-full mb-4 animate-beauty-pulse">
            <Package className="h-5 w-5 text-beauty-luxury dark:text-beauty-luxury" />
            <span className="text-sm font-semibold text-beauty-luxury dark:text-beauty-luxury">
              Special Bundle Deals
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground dark:text-foreground mb-4">
            {t(data.title, locale)}
          </h2>

          <p className="text-lg text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
            {t(data.description, locale)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {bundles.map((bundle, idx) => (
            <div
              key={idx}
              className="border-2 border-beauty-bloom/30 dark:border-beauty-bloom/40 rounded-xl overflow-hidden hover:border-beauty-bloom dark:hover:border-beauty-bloom transition-all duration-300 hover:shadow-lg"
            >
              <div className="bg-beauty-natural/10 dark:bg-beauty-natural/20 p-4 border-b border-beauty-bloom/20 dark:border-beauty-bloom/30">
                <h3 className="text-xl font-heading font-bold text-foreground dark:text-foreground">
                  {bundle.name}
                </h3>
              </div>

              <div className="p-6 bg-card dark:bg-card">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {bundle.products.map((product, productIdx) => (
                    <div
                      key={product.id}
                      className="aspect-square relative rounded-lg overflow-hidden bg-muted dark:bg-muted"
                    >
                      <Image
                        fill
                        alt={product.name || "Product"}
                        className="object-cover"
                        src={product.images?.[0] || "/placeholder.svg"}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4">
                  {bundle.products.map((product, productIdx) => (
                    <p
                      key={product.id}
                      className="text-sm text-text-light dark:text-text-lightdark truncate"
                    >
                      • {product.name}
                    </p>
                  ))}
                </div>

                <div className="border-t border-border dark:border-border pt-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-beauty-bloom dark:text-beauty-bloom">
                      ${bundle.price}
                    </span>
                    {bundle.originalPrice && (
                      <span className="text-lg text-muted-foreground dark:text-muted-foreground line-through">
                        ${bundle.originalPrice}
                      </span>
                    )}
                  </div>

                  {bundle.savings && (
                    <p className="text-sm text-beauty-natural dark:text-beauty-natural font-semibold mb-4">
                      {bundle.savings}
                    </p>
                  )}

                  <Button asChild className="w-full">
                    <Link href={`/search`}>View Bundle Products</Link>
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