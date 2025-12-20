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
                    <Link
                      className="group block h-full"
                      href={`/${locale}/brand/${brand.id}`}
                      aria-label={brand.name || "Brand"}
                    >
                      <div className="relative flex h-24 w-full items-center justify-center px-6 py-4 sm:h-28 md:h-32">
                        {imageUrl && !hasError ? (
                          <Image
                            fill
                            alt={brand.name || "Brand"}
                            className="object-contain opacity-70 transition-opacity duration-200 hover:opacity-100"
                            sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, (max-width: 1024px) 240px, 280px"
                            src={imageUrl}
                            onError={() => handleImageError(brand.id)}
                          />
                        ) : (
                          <span className="font-heading text-sm md:text-base font-semibold text-muted-foreground">
                            {brand.name || "Brand"}
                          </span>
                        )}
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
