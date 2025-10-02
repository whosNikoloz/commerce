import type { CategoryGridData, Locale } from "@/types/tenant"
import { t } from "@/lib/i18n"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

interface CategoryGridProps {
  data: CategoryGridData
  locale: Locale
}

export default function CategoryGrid({ data, locale }: CategoryGridProps) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-foreground text-balance">
          {t(data.title, locale)}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {data.categories.map((category, idx) => (
            <Link
              key={idx}
              href={category.href}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 bg-card border border-border hover:border-primary/50"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={category.imageUrl || "/placeholder.svg"}
                  alt={t(category.name, locale)}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-300" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform group-hover:translate-y-[-4px] transition-transform duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-balance">{t(category.name, locale)}</h3>
                    {category.productCount && (
                      <p className="text-sm text-gray-200 font-medium">{category.productCount} products</p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transform translate-x-[-8px] group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
