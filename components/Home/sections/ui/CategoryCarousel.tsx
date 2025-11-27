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

interface CategoryCarouselProps {
  data: CategoryCarouselData
  locale: Locale
  categories: CategoryModel[]
}

export default function CategoryCarousel({ data, locale, categories }: CategoryCarouselProps) {
  const splideRef = useRef<Splide | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

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
        trimSpace: false,
        focus: 0,
        omitEnd: true,
        breakpoints: {
          640: {
            perPage: 2.5,
            gap: "0.5rem",
            arrows: false,
            drag: true,
            trimSpace: false,
            focus: 0,
            padding: 0,
          },
          768: {
            perPage: 3,
            gap: "0.75rem",
            arrows: false,
            drag: true,
            trimSpace: false,
          },
          1024: {
            perPage: 3,
            gap: "0.875rem",
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

        <div className="w-full flex flex-row items-center gap-2 md:gap-3 overflow-visible">
          {/* Static "All Categories" Card */}
          {data.showAllCard && (
            <Link className="w-24 sm:w-28 md:w-36 lg:w-40 flex-shrink-0" href={data.allCategoriesHref || "/categories"}>
              <div className="w-full h-32 sm:h-40 md:h-48 lg:h-56 cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-3">
                  <Squares2X2Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                  <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-white text-center">
                    {t(data.allCardText || { ka: "ყველა", en: "All" }, locale)}
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Splide Carousel */}
          <div className="flex-1 min-w-0 overflow-visible">
            <div ref={containerRef} className="splide overflow-visible">
              <div className="splide__track overflow-visible">
                <ul className="splide__list">
                  {displayCategories.map((category) => {
                    const imageUrl = category.images && category.images.length > 0
                      ? category.images[0]
                      : "/placeholder.png"
                    const hasError = imageErrors.has(category.id)

                    return (
                      <li key={category.id} className="splide__slide h-32 sm:h-40 md:h-48 lg:h-56">
                        <Link className="block h-full" href={`/category/${category.id}`}>
                          <div className="group relative h-full w-full cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-gray-100 to-gray-200">
                            {/* Image */}
                            <Image
                              fill
                              alt={category.name || "Category"}
                              className="object-contain transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, (max-width: 1024px) 192px, 224px"
                              src={hasError ? "/placeholder.svg" : imageUrl}
                              onError={() => handleImageError(category.id)}
                            />

                            {/* Overlay with gradient - appears on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                            {/* Text Label - appears on hover */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                              <p className="text-white text-xs sm:text-sm md:text-base font-semibold text-center leading-tight drop-shadow-lg">
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
    </section>
  )
}
