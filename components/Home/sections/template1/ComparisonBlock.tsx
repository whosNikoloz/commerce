import type { ComparisonBlockData, Locale } from "@/types/tenant"
import { t, tOpt } from "@/lib/i18n"
import Link from "next/link"
import Image from "next/image"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ComparisonBlockProps {
  data: ComparisonBlockData
  locale: Locale
}

export default function ComparisonBlock({ data, locale }: ComparisonBlockProps) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">{t(data.title, locale)}</h2>
          {data.description && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {tOpt(data.description, locale)}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {data.products.map((product, idx) => (
            <div
              key={idx}
              className="border-2 border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:border-primary/50 transition-all duration-500 bg-card group"
            >
              <div className="aspect-square relative bg-muted overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={t(product.name, locale)}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="p-6 md:p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-balance">{t(product.name, locale)}</h3>

                <div className="space-y-3 mb-8">
                  {product.specs.map((spec, specIdx) => (
                    <div key={specIdx} className="flex items-start gap-3 text-sm">
                      <div className="bg-green-100 dark:bg-green-950 p-1 rounded-full mt-0.5 flex-shrink-0">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-muted-foreground leading-relaxed">
                        <strong className="text-foreground font-semibold">{t(spec.label, locale)}:</strong> {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <span className="text-3xl font-bold text-primary">${product.price}</span>
                  <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
                    <Link href={product.href}>View Details</Link>
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
