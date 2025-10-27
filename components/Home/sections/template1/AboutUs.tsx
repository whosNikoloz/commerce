import type { AboutUsData, Locale } from "@/types/tenant"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { t, tOpt } from "@/lib/i18n"

interface AboutUsProps {
  data: AboutUsData
  locale: Locale
  template?: 1 | 2 | 3
}

export default function AboutUs({ data, locale, template = 1 }: AboutUsProps) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-heading">
              {t(data.title, locale)}
            </h2>

            <div
              className="prose prose-lg max-w-none text-muted-foreground mb-8"
              dangerouslySetInnerHTML={{ __html: t(data.description, locale) }}
            />

            {/* Stats */}
            {data.stats && data.stats.length > 0 && (
              <div className="grid grid-cols-2 gap-6 mb-8">
                {data.stats.map((stat, index) => (
                  <div key={index} className="text-center md:text-left">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t(stat.label, locale)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            {data.cta && (
              <Button asChild size="lg" className="w-full md:w-auto">
                <Link href={data.cta.href}>
                  {t(data.cta.label, locale)}
                </Link>
              </Button>
            )}
          </div>

          {/* Image or Video */}
          <div className="order-1 md:order-2">
            {data.videoUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
                <iframe
                  src={data.videoUrl}
                  title={t(data.title, locale)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : data.imageUrl ? (
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={data.imageUrl}
                  alt={t(data.title, locale)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
