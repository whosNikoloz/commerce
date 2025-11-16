"use client"

import type { HeroData, Locale } from "@/types/tenant"

import { useEffect, useState } from "react"
import { Splide, SplideSlide } from "@splidejs/react-splide"
import "@splidejs/react-splide/css"
import "@splidejs/react-splide/css/core"
import Link from "next/link"
import Image from "next/image"

import { t } from "@/lib/i18n"

interface HeroClientProps {
  data: HeroData
  locale: Locale
}

export default function HeroClient({ data, locale }: HeroClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!data.banners || data.banners.length === 0) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">No banners available</p>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-xl flex items-center justify-center animate-pulse">
        <p className="text-muted-foreground">Loading carousel...</p>
      </div>
    )
  }

  const bannerHeight = data.bannerHeight || "400px"

  return (
    <div className="rounded-xl overflow-hidden shadow-lg" style={{ minHeight: bannerHeight }}>
      <Splide
        aria-label="Hero Banners"
        options={{
          type: "loop",
          autoplay: true,
          interval: 5000,
          pauseOnHover: true,
          pauseOnFocus: true,
          arrows: true,
          pagination: true,
          gap: 0,
          height: bannerHeight,
          cover: true,
          rewind: true,
          perPage: 1,
          lazyLoad: 'nearby',
          preloadPages: 1,
          updateOnMove: false,
        }}
      >
        {data.banners.map((banner, index) => (
          <SplideSlide key={index} style={{ height: bannerHeight }}>
            <Link className="block relative h-full w-full group" href={banner.href}>
              <div className="relative w-full h-full">
                <Image
                  fill
                  alt={t(banner.alt, locale)}
                  className="object-cover transition-transform duration-500"
                  fetchPriority={index === 0 ? "high" : "low"}
                  loading={index === 0 ? "eager" : "lazy"}
                  priority={index === 0}
                  quality={index === 0 ? 85 : 70}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px"
                  src={banner.imageUrl}
                />
                {banner.badge && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-10">
                    {t(banner.badge, locale)}
                  </div>
                )}
                {(banner.title || banner.description) && (
                  <div className="absolute inset-0 flex items-end">
                    <div className="p-8 text-white">
                      {banner.title && (
                        <h3 className="text-3xl md:text-4xl font-bold mb-2">
                          {t(banner.title, locale)}
                        </h3>
                      )}
                      {banner.description && (
                        <p className="text-lg md:text-xl text-white/90">
                          {t(banner.description, locale)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  )
}
