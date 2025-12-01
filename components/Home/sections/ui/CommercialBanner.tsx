'use client'
import type { CommercialBannerData, Locale } from "@/types/tenant";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Splide, SplideSlide, Splide as SplideCore } from "@splidejs/react-splide";

import { t } from "@/lib/i18n";

interface CommercialBannerProps {
  data: CommercialBannerData;
  locale: Locale;
}

function BannerItem({ banner, locale, index }: { banner: CommercialBannerData['banners'][0]; locale: Locale; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [desktopError, setDesktopError] = useState(false);
  const [mobileError, setMobileError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  const desktopImageUrl = desktopError || !banner.imageUrl ? "/placeholder.png" : banner.imageUrl;
  const mobileImageUrl = mobileError || !banner.mobileImageUrl && !banner.imageUrl
    ? "/placeholder.png"
    : (banner.mobileImageUrl || banner.imageUrl);

  return (
    <Link
      className={`group relative block overflow-hidden rounded-2xl  transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      href={`/${locale}${banner.href}`}
    >
      <div className="relative hidden md:block h-64 lg:h-80 xl:h-96">
        <Image
          fill
          alt={t(banner.alt, locale)}
          className="object-cover w-full h-full transition-transform duration-700 "
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw"
          src={desktopImageUrl}
          onError={() => setDesktopError(true)}
        />
      </div>

      {/* Mobile Image */}
      <div className="relative block md:hidden h-48">
        <Image
          fill
          alt={t(banner.alt, locale)}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
          src={mobileImageUrl}
          onError={() => setMobileError(true)}
        />
      </div>

      {/* Badge overlay */}
      {/* {banner.badge && (
        <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-primary text-primary-foreground text-sm md:text-base font-bold px-4 py-2 rounded-full shadow-lg">
          {t(banner.badge, locale)}
        </div>
      )} */}

    </Link>
  );
}

export default function CommercialBanner({ data, locale }: CommercialBannerProps) {
  const splideRef = useRef<SplideCore | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_canGoPrev, setCanGoPrev] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_canGoNext, setCanGoNext] = useState(true);

  const isCarousel = data.layout === "carousel";
  const columns = data.columns || 1;
  const carouselStyle = data.carouselStyle || "full-width"; // "full-width" or "grid"

  useEffect(() => {
    if (!isCarousel) return;

    const splide = splideRef.current?.splide;

    if (!splide) return;

    const updateArrows = () => {
      const index = splide.index;
      const length = splide.length;

      setCanGoPrev(index > 0);
      setCanGoNext(index < length - 1);
    };

    splide.on("mounted", updateArrows);
    splide.on("moved", updateArrows);
    splide.on("updated", updateArrows);
    splide.on("resized", updateArrows);

    return () => {
      splide.off("mounted");
      splide.off("moved");
      splide.off("updated");
      splide.off("resized");
    };
  }, [isCarousel]);

  // Grid Layout
  if (!isCarousel) {
    const gridClass = columns === 1
      ? "grid grid-cols-1 gap-6"
      : columns === 2
      ? "grid grid-cols-2 gap-4 md:gap-6"
      : "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6";

    return (
      <section className="relative overflow-hidden py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={gridClass}>
            {data.banners.map((banner, index) => (
              <BannerItem key={index} banner={banner} index={index} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Carousel Layout
  return (
    <section className="relative overflow-hidden py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative group">
          {/* Navigation Buttons */}
          {/* {canGoPrev && (
            <button
              aria-label="Previous"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-border shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 group-hover:-translate-x-2"
              type="button"
              onClick={() => splideRef.current?.go("<")}
            >
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </button>
          )}

          {canGoNext && (
            <button
              aria-label="Next"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-border shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-2"
              type="button"
              onClick={() => splideRef.current?.go(">")}
            >
              <ArrowRight className="h-6 w-6 text-foreground" />
            </button>
          )} */}

          {/* Carousel */}
          <Splide
            ref={splideRef as any}
            aria-label="Commercial Banners"
            options={
              carouselStyle === "grid"
                ? {
                    type: "slide",
                    gap: "1rem",
                    pagination: false,
                    arrows: true,
                    drag: "free",
                    trimSpace: true,
                    snap: false,
                    omitEnd: true,
                    focus: 0,
                    perMove: 1,
                    autoplay: false,
                    perPage: columns >= 3 ? 3 : columns >= 2 ? 2 : 1,
                    breakpoints: {
                      1280: { perPage: columns >= 3 ? 3 : columns >= 2 ? 2 : 1, gap: "1rem" },
                      1024: { perPage: columns >= 2 ? 2 : 1, gap: "0.75rem" },
                      768: { perPage: columns >= 2 ? 2 : 1, gap: "0.75rem" },
                      640: { perPage: 1, gap: "0.5rem" },
                    },
                  }
                : {
                    // Full-width carousel (original behavior)
                    type: "slide",
                    perPage: 1,
                    perMove: 1,
                    gap: "1.5rem",
                    pagination: true,
                    arrows: true,
                    drag: true,
                    autoplay: true,
                    interval: 5000,
                    pauseOnHover: true,
                    resetProgress: false,
                  }
            }
          >
            {data.banners.map((banner, index) => (
              <SplideSlide key={index} className={carouselStyle === "grid" ? "!h-auto" : ""}>
                <BannerItem banner={banner} index={carouselStyle === "grid" ? 0 : index} locale={locale} />
              </SplideSlide>
            ))}
          </Splide>
        </div>
      </div>
    </section>
  );
}
