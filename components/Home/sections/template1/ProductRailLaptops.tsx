import type { ProductRailData, Locale } from "@/types/tenant"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { t, tOpt } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

interface ProductRailLaptopsProps {
  data: ProductRailData
  locale: Locale
}

export default function ProductRailLaptops({ data, locale }: ProductRailLaptopsProps) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">{t(data.title, locale)}</h2>
            {data.subtitle && <p className="text-muted-foreground mt-3 text-lg">{tOpt(data.subtitle, locale)}</p>}
          </div>

          <Button asChild className="group self-start sm:self-auto" variant="ghost">
            <Link className="flex items-center gap-2 font-semibold" href={data.viewAllHref}>
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: data.limit }).map((_, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-square bg-muted rounded-xl mb-4 animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded-lg animate-pulse" />
                <div className="h-4 bg-muted rounded-lg w-3/4 animate-pulse" />
                <div className="h-7 bg-muted rounded-lg w-24 animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <span className="inline-block px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground font-medium">
            Products from category: <span className="font-semibold text-foreground">{data.category}</span>
          </span>
        </div>
      </div>
    </section>
  )
}
