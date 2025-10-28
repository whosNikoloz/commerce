"use client"

import type { EmblaOptionsType } from "embla-carousel"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { BrandModel } from "@/types/brand"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export function BrandCard({
  brand,
  logoUrl = "/placeholder.svg",
  template = 1,
  className = "",
}: {
  brand: BrandModel
  logoUrl?: string
  template?: 1 | 2 | 3 | 4
  className?: string
}) {
  const href = `/brands/${brand.id}`

  const wrapperStyles: Record<1 | 2 | 3 | 4, string> = {
    1: "relative h-16 md:h-20 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-500 hover:scale-110",
    2: "relative h-20 md:h-24 opacity-60 hover:opacity-100 transition-all duration-700 hover:scale-105 filter hover:drop-shadow-lg",
    3: "relative h-16 md:h-20 grayscale-[50%] hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-500 hover:scale-110",
    4: "relative h-20 md:h-24 lg:h-28 grayscale-[30%] hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-500 hover:scale-110 hover:drop-shadow-2xl",
  }

  return (
    <Link className={cn("block group", className)} href={href}>
      <div className={wrapperStyles[template]}>
        <Image fill alt={brand.name || "Brand"} className="object-contain" sizes="200px" src={logoUrl} unoptimized />
      </div>
    </Link>
  )
}

export function BrandCardSkeleton({ template = 1 }: { template?: 1 | 2 | 3 | 4 }) {
  const wrapperStyles: Record<1 | 2 | 3 | 4, string> = {
    1: "h-16 md:h-20",
    2: "h-20 md:h-24",
    3: "h-16 md:h-20",
    4: "h-20 md:h-24 lg:h-28",
  }

  return <div className={cn(wrapperStyles[template], "bg-muted rounded animate-pulse w-full")} />
}

// === Brands Carousel ===
export interface BrandsCarouselProps {
  brands: BrandModel[]
  getLogoUrl?: (b: BrandModel) => string | undefined
  template?: 1 | 2 | 3 | 4
  className?: string
  /** autoplay in ms, set 0/false to disable */
  autoplayMs?: number | false
  /** visible slides per breakpoint */
  slidesPerView?: {
    base?: number // <640px
    sm?: number // >=640px
    md?: number // >=768px
    lg?: number // >=1024px
    xl?: number // >=1280px
  }
  loop?: boolean
  showDots?: boolean
  showArrows?: boolean
  title?: string
  badge?: string
}

export function BrandsCarousel({
  brands,
  getLogoUrl,
  template = 1,
  className,
  autoplayMs = 2600,
  slidesPerView = { base: 2.2, sm: 3.2, md: 5.2, lg: 6.2, xl: 7.2 },
  loop = true,
  showDots = true,
  showArrows = true,
  title,
  badge,
}: BrandsCarouselProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop } as EmblaOptionsType,
    autoplayMs ? [Autoplay({ delay: autoplayMs, stopOnInteraction: false, stopOnMouseEnter: true })] : [],
  )

  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", () => setScrollSnaps(emblaApi.scrollSnapList()))

    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  // responsive basis via CSS vars -> gridless, smooth
  const itemBasis = {
    base: `calc(100% / ${slidesPerView.base ?? 2.2})`,
    sm: `calc(100% / ${slidesPerView.sm ?? 3.2})`,
    md: `calc(100% / ${slidesPerView.md ?? 5.2})`,
    lg: `calc(100% / ${slidesPerView.lg ?? 6.2})`,
    xl: `calc(100% / ${slidesPerView.xl ?? 7.2})`,
  }

  return (
    <section className={cn("w-full", className)}>
      {/* Header */}
      {(title || badge) && (
        <div className="mb-4 flex items-center gap-3">
          {badge && <Badge className="bg-brand-primary text-white">{badge}</Badge>}
          {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
        </div>
      )}

      <div className="relative">
        {/* Arrows */}
        {showArrows && (
          <div className="pointer-events-none absolute inset-y-0 z-10 hidden items-center justify-between md:flex">
            <Button
              aria-label="Previous"
              className="pointer-events-auto ml-2 h-8 w-8 rounded-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60"
              size="icon"
              type="button"
              variant="secondary"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Next"
              className="pointer-events-auto mr-2 h-8 w-8 rounded-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60"
              size="icon"
              type="button"
              variant="secondary"
              onClick={scrollNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Embla viewport */}
        <div ref={emblaRef} aria-roledescription="carousel" className="overflow-hidden">
          <div
            className="flex"
            style={
              {
                // responsive item widths
                // tailwind doesn't allow custom fractions easily for .basis-*
                // so we compute with CSS vars per breakpoint using utility classes below
              }
            }
          >
            {brands.map((brand) => {
              const logo = getLogoUrl?.(brand) ?? "/placeholder.svg"

              return (
                <div
                  key={brand.id}
                  className={cn(
                    "shrink-0 px-2",
                    "[flex-basis:calc(100%/2.2)] sm:[flex-basis:calc(100%/3.2)] md:[flex-basis:calc(100%/5.2)] lg:[flex-basis:calc(100%/6.2)] xl:[flex-basis:calc(100%/7.2)]",
                  )}
                >
                  <BrandCard brand={brand} logoUrl={logo} template={template} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Dots */}
      {showDots && scrollSnaps.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                i === selectedIndex ? "bg-foreground w-4" : "bg-muted-foreground/30 hover:bg-muted-foreground/70",
              )}
              onClick={() => emblaApi?.scrollTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// === Skeleton for the Carousel ===
export function BrandsCarouselSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="w-full">
      <div className="flex overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 px-2 [flex-basis:calc(100%/2.2)] sm:[flex-basis:calc(100%/3.2)] md:[flex-basis:calc(100%/5.2)] lg:[flex-basis:calc(100%/6.2)] xl:[flex-basis:calc(100%/7.2)]"
          >
            <Skeleton className="h-16 w-full rounded bg-muted md:h-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
