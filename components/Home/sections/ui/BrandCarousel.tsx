"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import Splide from "@splidejs/splide"
import "@splidejs/splide/css"
import { AutoScroll } from "@splidejs/splide-extension-auto-scroll"

// eslint-disable-next-line import/order
import type { BrandCarouselData, Locale } from "@/types/tenant"
// eslint-disable-next-line import/order
import type { BrandModel } from "@/types/brand"

import { t } from "@/lib/i18n"

interface BrandCarouselProps {
  data: BrandCarouselData
  locale: Locale
  brands: BrandModel[]
}

export default function BrandCarousel({ data, locale, brands }: BrandCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const splideRef = useRef<Splide | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  // Clamp perPage so autoplay can actually slide (needs more slides than perPage)
  const requestedPerPage = data.slidesPerView || 6
  const perPage = Math.max(1, Math.min(requestedPerPage, Math.max(1, brands.length - 1)))
  const autoplayEnabled = (data.autoplay ?? false) && brands.length > perPage
  const autoScrollSpeed = data.autoScrollSpeed ?? 0.8
  const showHeader = data.showHeader ?? Boolean(data.title || data.subtitle)

  useEffect(() => {
    if (!containerRef.current || brands.length === 0) return

    const options: Record<string, any> = {
      type: "loop",
      perPage,
      gap: "1rem",
      pagination: data.showPagination ?? false,
      arrows: data.showArrows ?? true,
      interval: data.autoplayInterval || 3500,
      pauseOnHover: true,
      drag: "free",
      flickPower: 300,
      trimSpace: true,
      focus: 0,
      breakpoints: {
        640: { perPage: Math.min(perPage, 2), gap: "0.5rem", arrows: false },
        768: { perPage: Math.min(perPage, 3), gap: "0.75rem", arrows: false },
        1024: { perPage: Math.min(perPage, 4), gap: "0.875rem" },
        1280: { perPage: Math.min(perPage, 5), gap: "0.875rem" },
      },
    }

    if (autoplayEnabled) {
      options.autoScroll = {
        speed: autoScrollSpeed,
        pauseOnHover: true,
        pauseOnFocus: false,
      }
    }

    splideRef.current = new Splide(containerRef.current, options)
    const extensions = autoplayEnabled ? { AutoScroll } : undefined

    splideRef.current.mount(extensions as any)

    return () => {
      splideRef.current?.destroy()
      splideRef.current = null
    }
  }, [
    brands,
    perPage,
    data.showPagination,
    data.showArrows,
    autoplayEnabled,
    data.autoplayInterval,
    autoScrollSpeed,
  ])

  const handleImageError = (id: string) => {
    setImageErrors(prev => new Set(prev).add(id))
  }

  if (!brands.length) return null

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        {showHeader && (
          <div className="mb-8 space-y-2">
            {data.title && (
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-balance">
                {t(data.title, locale)}
              </h2>
            )}
            {data.subtitle && (
              <p className="font-primary text-muted-foreground text-sm md:text-base">
                {t(data.subtitle, locale)}
              </p>
            )}
          </div>
        )}

        <div ref={containerRef} className="splide">
          <div className="splide__track">
            <ul className="splide__list">
              {brands.map((brand) => {
                const imageUrl = brand.images?.[0]
                const hasError = brand.id ? imageErrors.has(brand.id) : false

                return (
                  <li key={brand.id} className="splide__slide">
                    <Link className="group block h-full" href={`/${locale}/brand/${brand.id}`}>
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative flex h-32 w-full items-center justify-center rounded-xl border border-border bg-card/80 px-6 py-4 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10 sm:h-36 md:h-40">
                          {imageUrl && !hasError ? (
                            <Image
                              fill
                              alt={brand.name || "Brand"}
                              className="object-contain transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 220px, (max-width: 768px) 260px, (max-width: 1024px) 280px, 320px"
                              src={imageUrl}
                              onError={() => handleImageError(brand.id)}
                            />
                          ) : (
                            <span className="font-heading text-base md:text-lg font-semibold text-muted-foreground">
                              {brand.name || "Brand"}
                            </span>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="font-heading text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                            {brand.name || "Brand"}
                          </p>
                          {brand.origin && (
                            <p className="font-primary text-xs text-muted-foreground mt-0.5">
                              {brand.origin}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
