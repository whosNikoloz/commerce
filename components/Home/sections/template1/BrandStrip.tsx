import type { BrandStripData, Locale } from "@/types/tenant"

import Link from "next/link"
import Image from "next/image"

import { tOpt } from "@/lib/i18n"

interface BrandStripProps {
  data: BrandStripData
  locale: Locale
}

export default function BrandStrip({ data, locale }: BrandStripProps) {
  return (
    <section className="py-16 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4">
        {data.title && (
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">{tOpt(data.title, locale)}</h2>
        )}

        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 md:gap-12 items-center">
          {data.brands.map((brand, idx) => {
            const content = (
              <div className="relative h-16 md:h-20 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-500 hover:scale-110">
                <Image
                  fill
                  alt={brand.name}
                  className="object-contain filter"
                  src={brand.logoUrl || "/placeholder.svg"}
                />
              </div>
            )

            if (brand.href) {
              return (
                <Link key={idx} className="block group" href={brand.href}>
                  {content}
                </Link>
              )
            }

            return <div key={idx}>{content}</div>
          })}
        </div>
      </div>
    </section>
  )
}
