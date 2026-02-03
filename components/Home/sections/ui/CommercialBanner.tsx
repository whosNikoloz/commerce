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

function BannerItem({
  banner,
  locale,
  index,
  bannerHeight
}: {
  banner: CommercialBannerData['banners'][0];
  locale: Locale;
  index: number;
  bannerHeight?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [desktopError, setDesktopError] = useState(false);
  const [laptopError, setLaptopError] = useState(false);
  const [mobileError, setMobileError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  const desktopImageUrl = desktopError || !banner.imageUrl ? "/placeholder.png" : banner.imageUrl;
  const laptopImageUrl = laptopError || !banner.laptopImageUrl
    ? null
    : banner.laptopImageUrl;
  const mobileImageUrl = mobileError || !banner.mobileImageUrl && !banner.imageUrl
    ? "/placeholder.png"
    : (banner.mobileImageUrl || banner.imageUrl);

  // Determine visibility classes based on which images are available
  const desktopVisibilityClass = banner.laptopImageUrl
    ? 'hidden lg:block'
    : 'hidden md:block';

  // Use custom height or default heights
  const hasCustomHeight = !!bannerHeight;

  return (
    <Link
      aria-label={t(banner.alt, locale)}
      className={`group relative block overflow-hidden rounded-2xl transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      href={`/${locale}${banner.href}`}
    >
      {/* Desktop Image (lg and above) */}
      <div
        className={`relative ${desktopVisibilityClass} ${!hasCustomHeight ? 'h-64 lg:h-80 xl:h-96' : ''}`}
        style={hasCustomHeight ? { height: bannerHeight } : undefined}
      >
        <Image
          fill
          alt={t(banner.alt, locale)}
          className="object-cover w-full h-full transition-transform duration-700"
          sizes="1200px"
          src={desktopImageUrl}
          onError={() => setDesktopError(true)}
        />
      </div>

      {/* Laptop/Tablet Image (md to lg) */}
      {laptopImageUrl && (
        <div
          className={`relative hidden md:block lg:hidden ${!hasCustomHeight ? 'h-64' : ''}`}
          style={hasCustomHeight ? { height: bannerHeight } : undefined}
        >
          <Image
            fill
            alt={t(banner.alt, locale)}
            className="object-cover w-full h-full transition-transform duration-700"
            sizes="(max-width: 1024px) 100vw"
            src={laptopImageUrl}
            onError={() => setLaptopError(true)}
          />
        </div>
      )}

      {/* Mobile Image (below md) */}
      <div
        className={`relative block md:hidden ${!hasCustomHeight ? 'h-48' : ''}`}
        style={hasCustomHeight ? { height: bannerHeight } : undefined}
      >
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
      {banner.badge && (
        <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-primary text-primary-foreground text-sm md:text-base font-bold px-4 py-2 rounded-full shadow-lg">
          {t(banner.badge, locale)}
        </div>
      )}

    </Link>
  );
}

export default function CommercialBanner({ data, locale }: CommercialBannerProps) {
  const splideRef = useRef<SplideCore | null>(null);

  const isCarousel = data.layout === "carousel";
  const columns = data.columns || 1;
  const carouselStyle = data.carouselStyle || "full-width";
  const scrollDirection = data.scrollDirection || "horizontal";
  const showArrows = data.showArrows ?? true;
  const autoScroll = data.autoScroll ?? true;
  const autoScrollInterval = data.autoScrollInterval || 5000;
  const bannerHeight = data.bannerHeight;

  // Grid Layout
  if (!isCarousel) {
    const gridClass = columns === 1
      ? "grid grid-cols-1 gap-6"
      : columns === 2
      ? "grid grid-cols-2 gap-4 md:gap-6"
      : columns === 3
      ? "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
      : columns === 4
      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6";

    return (
      <section className="relative overflow-hidden py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={gridClass}>
            {data.banners.map((banner, index) => (
              <BannerItem
                key={index}
                banner={banner}
                bannerHeight={bannerHeight}
                index={index}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Vertical scroll direction requires fixed height
  const isVertical = scrollDirection === "vertical";
  const carouselHeight = bannerHeight || (isVertical ? "500px" : undefined);

  // Build Splide options based on configuration

  console.log("Rendering CommercialBanner with data:", scrollDirection);
  const getSplideOptions = () => {
    const baseOptions = {
      direction: isVertical ? ("ttb" as const) : ("ltr" as const),
      height: isVertical ? carouselHeight : undefined,
      arrows: showArrows,
      autoplay: autoScroll,
      interval: autoScrollInterval,
      pauseOnHover: true,
      pauseOnFocus: true,
      resetProgress: false,
      wheel: isVertical, // Enable mouse wheel scrolling for vertical
    };

    if (carouselStyle === "grid") {
      return {
        ...baseOptions,
        type: "slide" as const,
        gap: "1rem",
        pagination: false,
        drag: "free" as const,
        trimSpace: true,
        snap: false,
        omitEnd: true,
        focus: 0 as const,
        perMove: 1,
        perPage: columns >= 3 ? 3 : columns >= 2 ? 2 : 1,
        breakpoints: {
          1280: { perPage: columns >= 3 ? 3 : columns >= 2 ? 2 : 1, gap: "1rem" },
          1024: { perPage: columns >= 2 ? 2 : 1, gap: "0.75rem" },
          768: { perPage: columns >= 2 ? 2 : 1, gap: "0.75rem" },
          640: { perPage: 1, gap: "0.5rem" },
        },
      };
    }

    // Full-width carousel
    return {
      ...baseOptions,
      type: "slide" as const,
      perPage: 1,
      perMove: 1,
      gap: isVertical ? "1rem" : "1.5rem",
      pagination: true,
      drag: true,
    };
  };

  // Get slide height for vertical mode
  const getSlideStyle = () => {
    if (isVertical && carouselHeight) {
      return { height: carouselHeight };
    }

    return undefined;
  };

  // Carousel Layout
  return (
    <section className="relative overflow-hidden py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative group">
          <Splide
            ref={splideRef as any}
            aria-label="Commercial Banners"
            options={getSplideOptions()}
          >
            {data.banners.map((banner, index) => (
              <SplideSlide
                key={index}
                className={carouselStyle === "grid" ? "!h-auto" : ""}
                style={getSlideStyle()}
              >
                <BannerItem
                  banner={banner}
                  bannerHeight={isVertical ? carouselHeight : bannerHeight}
                  index={carouselStyle === "grid" ? 0 : index}
                  locale={locale}
                />
              </SplideSlide>
            ))}
          </Splide>
        </div>
      </div>
    </section>
  );
}
