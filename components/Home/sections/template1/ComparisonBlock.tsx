import type { ComparisonBlockData, Locale } from "@/types/tenant"
import type { ProductResponseModel } from "@/types/product"
import { t, tOpt } from "@/lib/i18n"
import Link from "next/link"
import Image from "next/image"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { searchProductsByFilter } from "@/app/api/services/productService"
import { getAllCategories } from "@/app/api/services/categoryService"

interface ComparisonBlockProps {
  data: ComparisonBlockData
  locale: Locale
  template?: 1 | 2 | 3
}

export default async function ComparisonBlock({ data, locale, template = 1 }: ComparisonBlockProps) {
  let products: ProductResponseModel[] = []

  try {
    // Get products from the same category for comparison
    const categories = await getAllCategories()
    const category = categories.find(c => c.isActive && !c.parentId)

    if (category) {
      const result = await searchProductsByFilter({
        filter: { categoryIds: [category.id] },
        pageSize: 3,
        page: 1,
        sortBy: "featured"
      })
      products = result.items || []
    }
  } catch (e) {
    console.error("Failed to load comparison products:", e)
  }
  return (
    <section className="py-20 bg-brand-surface dark:bg-brand-surfacedark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-text-light dark:text-text-lightdark mb-6 text-balance">
            {t(data.title, locale)}
          </h2>
          {data.description && (
            <p className="text-lg md:text-xl text-text-subtle dark:text-text-subtledark max-w-3xl mx-auto leading-relaxed">
              {tOpt(data.description, locale)}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {products.slice(0, 3).map((product, idx) => (
            <div
              key={product.id}
              className="border-2 border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:border-brand-primary/50 transition-all duration-500 bg-card group"
            >
              <div className="aspect-square relative bg-brand-muted dark:bg-brand-muteddark overflow-hidden">
                <Image
                  src={product.images?.[0] || "/placeholder.svg"}
                  alt={product.name || "Product"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="p-6 md:p-8">
                <h3 className="text-2xl font-bold font-heading text-text-light dark:text-text-lightdark mb-6 text-balance">
                  {product.name}
                </h3>

                <div className="space-y-3 mb-8">
                  {product.productFacetValues?.slice(0, 3).map((facet, specIdx) => (
                    <div key={specIdx} className="flex items-start gap-3 text-sm">
                      <div className="bg-tech-neon/10 dark:bg-tech-neon/20 p-1 rounded-full mt-0.5 flex-shrink-0">
                        <Check className="h-3 w-3 text-tech-neon" />
                      </div>
                      <span className="text-text-subtle dark:text-text-subtledark leading-relaxed">
                        <strong className="text-text-light dark:text-text-lightdark font-semibold">
                          {facet.facet?.name}:
                        </strong>{" "}
                        {facet.values?.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <span className="text-3xl font-bold text-brand-primary">${product.discountPrice || product.price}</span>
                  <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
                    <Link href={`/product/${product.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
