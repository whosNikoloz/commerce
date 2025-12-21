"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import Splide from "@splidejs/splide"
import "@splidejs/splide/css"
import { Squares2X2Icon } from "@heroicons/react/24/outline"

// eslint-disable-next-line import/order
import type { CategoryCarouselData, Locale } from "@/types/tenant"
// eslint-disable-next-line import/order
import type { CategoryModel } from "@/types/category"

import { t } from "@/lib/i18n"
import { useIsMobile } from "@/hooks/use-mobile"
import CategoryDrawer from "@/components/Categories/category-drawer"
import CategoryDropdown from "@/components/Categories/category-dropdown"

interface CategoryCarouselProps {
  data: CategoryCarouselData
  locale: Locale
  categories: CategoryModel[]
}

export default function CategoryCarousel({ data, locale, categories }: CategoryCarouselProps) {
  const splideRef = useRef<Splide | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const categoryContainerRef = useRef<HTMLDivElement | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const isMobile = useIsMobile()

  useEffect(() => {
    if (containerRef.current && categories.length > 0) {
      splideRef.current = new Splide(containerRef.current, {
        type: "slide",
        perPage: data.slidesPerView || 4,
        gap: "1rem",
        pagination: data.showPagination ?? false,
        arrows: data.showArrows ?? true,
        drag: true,
        flickPower: 300,
        dragMinThreshold: {
          mouse: 4,
          touch: 10,
        },
        autoWidth: false,
        autoplay: data.autoplay ?? false,
        interval: data.autoplayInterval || 3000,
        pauseOnHover: true,
        trimSpace: true,
        focus: 0,
        omitEnd: false,
        breakpoints: {
          640: {
            perPage: 2.5,
            gap: "0.5rem",
            arrows: false,
            drag: true,
            trimSpace: true,
            focus: 0,
            padding: 0,
          },
          768: {
            perPage: 3,
            gap: "0.75rem",
            arrows: false,
            drag: true,
            trimSpace: true,
          },
          1024: {
            perPage: 3,
            gap: "0.875rem",
            trimSpace: true,
          },
        },
      })

      splideRef.current.mount()

      return () => {
        if (splideRef.current) {
          splideRef.current.destroy()
        }
      }
    }
  }, [categories, data.slidesPerView, data.showPagination, data.showArrows, data.autoplay, data.autoplayInterval])

  const handleImageError = (categoryId: string) => {
    setImageErrors(prev => new Set(prev).add(categoryId))
  }

  const handleAllCategoriesClick = () => {
    // Find and click the button inside the category container
    if (categoryContainerRef.current) {
      const button = categoryContainerRef.current.querySelector('button')

      if (button) {
        button.click()
      }
    }
  }

  // Filter categories based on configuration
  let displayCategories = categories

  // If specific category IDs are provided, filter by those
  if (data.categoryIds && data.categoryIds.length > 0) {
    displayCategories = displayCategories.filter(cat => data.categoryIds?.includes(cat.id))
  }

  // Limit the number of categories
  if (data.limit) {
    displayCategories = displayCategories.slice(0, data.limit)
  }

  if (displayCategories.length === 0) {
    return null
  }

  return (
    <section className="relative py-10 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        {data.showHeader && (
          <div className="mb-8 md:mb-10 flex flex-col gap-3 md:gap-4">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance font-heading tracking-tight">
                {t(data.title, locale)}
              </h2>
            )}
            {data.subtitle && (
              <p className="font-primary text-muted-foreground text-base md:text-lg max-w-2xl">
                {t(data.subtitle, locale)}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 md:gap-4">
          {/* Fixed "All Categories" Card */}
          {data.showAllCard && (
            <div className="flex-shrink-0">
              <button
                aria-label={t(data.allCardText || { ka: "ყველა კატეგორია", en: "View all categories" }, locale)}
                className="font-primary block"
                type="button"
                onClick={handleAllCategoriesClick}
              >
                <div className="h-32 sm:h-40 md:h-48 lg:h-56 w-24 sm:w-28 md:w-36 lg:w-40 cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-3">
                    <Squares2X2Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-foreground" />
                    <p className="font-primary text-[10px] sm:text-xs md:text-sm font-semibold text-foreground text-center">
                      {t(data.allCardText || { ka: "ყველა", en: "All" }, locale)}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Splide Carousel */}
          <div className="flex-1 min-w-0">
            <div ref={containerRef} className="splide">
              <div className="splide__track">
                <ul className="splide__list">
                  {displayCategories.map((category) => {
                    const imageUrl = category.images && category.images.length > 0
                      ? category.images[0]
                      : "/placeholder.png"
                    const hasError = imageErrors.has(category.id)

                    return (
                      <li key={category.id} className="splide__slide">
                        <Link className="block h-full" href={`/category/${category.id}`}>
                          <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 w-full cursor-pointer rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm">
                            {/* Background accent */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

                            {/* Image */}
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-28 lg:h-28">
                              <Image
                                fill
                                alt={category.name || "Category"}
                                className="object-contain drop-shadow-md"
                                sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, (max-width: 1024px) 96px, 112px"
                                src={hasError ? "/placeholder.png" : imageUrl}
                                onError={() => handleImageError(category.id)}
                              />
                            </div>

                            {/* Text content */}
                            <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4 z-10">
                              <h3 className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-heading font-semibold text-foreground truncate">
                                {category.name}
                              </h3>
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
        </div>
      </div>

      {/* Hidden category triggers - conditionally render based on screen size */}
      <div ref={categoryContainerRef} className="sr-only">
        {isMobile ? (
          // Mobile: render CategoryDrawer
          <CategoryDrawer />
        ) : (
          // Desktop: render CategoryDropdown
          <CategoryDropdown />
        )}
      </div>
    </section>
  )
}
