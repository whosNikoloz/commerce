'use client'
import type { CommercialBannerData, Locale } from "@/types/tenant";

import { useRef, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Splide, SplideSlide, Splide as SplideCore } from "@splidejs/react-splide";

import { t } from "@/lib/i18n";

interface CommercialBannerProps {
  data: CommercialBannerData;
  locale: Locale;
}

const BannerItem = memo(function BannerItem({
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
  // Remove staggered animation to make it feel snappier
  const isVisible = true;

  const desktopImageUrl = banner.imageUrl || "/placeholder.png";
  const laptopImageUrl = banner.laptopImageUrl || null;
  const mobileImageUrl = banner.mobileImageUrl || banner.imageUrl || "/placeholder.png";

  // Determine visibility classes based on which images are available
  const desktopVisibilityClass = banner.laptopImageUrl
    ? 'hidden lg:block'
    : 'hidden md:block';

  // Use custom height or default heights
  const hasCustomHeight = !!bannerHeight;

  const badgeText =
    banner.badge ? t(banner.badge, locale)?.trim() : "";

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
          priority={index === 0}
          sizes="1200px"
          src={desktopImageUrl}
          onError={() => console.error('Image load error')}
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
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw"
            src={laptopImageUrl}
            onError={() => console.error('Image load error')}
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
          priority={index === 0}
          sizes="100vw"
          src={mobileImageUrl}
          onError={() => console.error('Image load error')}
        />
      </div>

      {/* Badge overlay */}
      {badgeText !== "" && (
        <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-primary text-primary-foreground text-sm md:text-base font-bold px-4 py-2 rounded-full shadow-lg">
          {badgeText}
        </div>
      )}

    </Link>
  );
});

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

  // Vertical scroll direction requires fixed height
  const isVertical = scrollDirection === "vertical";
  const carouselHeight = bannerHeight || (isVertical ? "500px" : undefined);

  // Memoize Splide options to avoid re-renders
  const splideOptions = useMemo(() => {
    const baseOptions = {
      direction: isVertical ? ("ttb" as const) : ("ltr" as const),
      height: isVertical ? carouselHeight : undefined,
      // If vertical and showArrows is requested, we show dots instead of arrows
      arrows: isVertical && showArrows ? false : showArrows,
      pagination: isVertical && showArrows ? true : true,
      autoplay: autoScroll,
      interval: autoScrollInterval,
      pauseOnHover: true,
      pauseOnFocus: true,
      resetProgress: false,
      wheel: isVertical, // Enable mouse wheel scrolling for vertical
      speed: 600, // Faster, smoother transition
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    };

    if (carouselStyle === "grid") {
      return {
        ...baseOptions,
        type: "slide" as const,
        gap: "1rem",
        pagination: isVertical && showArrows ? true : false,
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

    return {
      ...baseOptions,
      type: "slide" as const,
      perPage: 1,
      perMove: 1,
      gap: isVertical ? "1rem" : "1.5rem",
      pagination: true,
      drag: true,
    };
  }, [isVertical, carouselHeight, showArrows, autoScroll, autoScrollInterval, carouselStyle, columns]);

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
        <div className={`relative group ${isVertical && showArrows ? '[&_.splide__pagination]:flex-col [&_.splide__pagination]:!left-auto [&_.splide__pagination]:!right-4 [&_.splide__pagination]:!top-1/2 [&_.splide__pagination]:!-translate-y-1/2 [&_.splide__pagination]:!bottom-auto [&_.splide__pagination]:!gap-3 [&_.splide__pagination]:!z-50 [&_.splide__pagination]:!pointer-events-auto [&_.splide__pagination__page]:!bg-white/50 [&_.splide__pagination__page.is-active]:!bg-white [&_.splide__pagination__page.is-active]:!scale-150 [&_.splide__pagination__page]:!transition-all [&_.splide__pagination__page]:!duration-75 [&_.splide__pagination__page]:!w-2.5 [&_.splide__pagination__page]:!h-2.5 [&_.splide__pagination__page]:!shadow-md' : ''}`}>
          <Splide
            ref={splideRef as any}
            aria-label="Commercial Banners"
            options={splideOptions}
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
