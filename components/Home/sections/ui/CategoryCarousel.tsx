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
    <section className="relative py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        {data.showHeader && (
          <div className="mb-8">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance font-heading">
                {t(data.title, locale)}
              </h2>
            )}
            {data.subtitle && (
              <p className="text-muted-foreground mt-3 text-lg">{t(data.subtitle, locale)}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 md:gap-4">
          {/* Fixed "All Categories" Card */}
          {data.showAllCard && (
            <div className="flex-shrink-0">
              <button
                className="block"
                type="button"
                onClick={handleAllCategoriesClick}
              >
                <div className="h-32 sm:h-40 md:h-48 lg:h-56 w-24 sm:w-28 md:w-36 lg:w-40 cursor-pointer overflow-hidden rounded-lg border border-border transition-all duration-300 hover:-translate-y-1">
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-3">
                    <Squares2X2Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-foreground" />
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground text-center">
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
                          <div className="group relative h-32 sm:h-40 md:h-48 lg:h-56 w-full cursor-pointer overflow-hidden rounded-lg border border-border transition-all duration-300 hover:-translate-y-1">
                            {/* Image */}
                            <Image
                              fill
                              alt={category.name || "Category"}
                              className="object-contain transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, (max-width: 1024px) 192px, 224px"
                              src={hasError ? "/placeholder.svg" : imageUrl}
                              onError={() => handleImageError(category.id)}
                            />

                            {/* Text Label - always visible at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-background/80 backdrop-blur-sm">
                              <p className="text-foreground text-xs sm:text-sm md:text-base font-semibold text-center leading-tight">
                                {category.name}
                              </p>
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
      <div ref={categoryContainerRef} aria-hidden="true" className="sr-only">
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
