"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import { Badge as UIBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Slide = {
  imageUrl: string;
  mobileImageUrl?: string;
  href?: string;
  altText: string;
  badgeText?: string;
  titleText?: string;
  descText?: string;
};

type Tile = {
  imageUrl: string;
  href: string;
  titleText: string;
  subtitleText?: string;
};

interface HeroBrandClientProps {
  headline: string;
  subheadline?: string;
  badge?: string;
  backgroundImage?: string;
  slides?: Slide[];
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  tiles?: Tile[];
  className?: string;
}

const btnBase =
  "inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-light tracking-widest uppercase transition-all duration-300 active:scale-[.97] focus:outline-none focus:ring-2 focus:ring-offset-2";
const btnPrimary = `${btnBase} bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg hover:shadow-xl`;
const btnSecondary = `${btnBase} bg-white/10 text-white backdrop-blur-md border border-white/30 hover:bg-white/20 hover:border-white/50`;
const btnOutlineLight = `${btnBase} border-2 border-white text-white hover:bg-white hover:text-black backdrop-blur-sm`;

export default function HeroBrandClient({
  headline,
  subheadline,
  badge,
  backgroundImage,
  slides = [],
  primaryCta,
  secondaryCta,
  tiles = [],
  className,
}: HeroBrandClientProps) {
  const router = useRouter();
  const isCarousel = slides.length > 0;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    isCarousel ? [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })] : []
  );

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const go = (href?: string) => href && router.push(href);

  return (
    <div className={cn("space-y-8", className)}>
      {/* HERO - Fashion Forward Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-surface to-brand-surface/50 dark:from-brand-surfacedark dark:to-brand-surfacedark/50">
        {isCarousel ? (
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">
                {slides.map((slide, i) => {
                  const clickable = !!slide.href;

                  return (
                    <div key={i} className="relative shrink-0 basis-full">
                      <div
                        aria-label={clickable ? slide.altText : undefined}
                        className={cn("group block", clickable ? "cursor-pointer" : "cursor-default")}
                        role={clickable ? "link" : undefined}
                        tabIndex={clickable ? 0 : -1}
                        onClick={clickable ? () => go(slide.href) : undefined}
                        onKeyDown={
                          clickable
                            ? (e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  go(slide.href);
                                }
                              }
                            : undefined
                        }
                      >
                        <div className="relative h-[75vh] min-h-[600px] w-full">
                          <Image
                            fill
                            alt={slide.altText}
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority={i === 0}
                            sizes="100vw"
                            src={slide.imageUrl}
                          />
                          {/* Sophisticated gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

                          {/* Content Container */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center px-6 max-w-4xl">
                              {slide.badgeText && (
                                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/30 rounded-full">
                                  <Sparkles className="w-4 h-4 text-white" />
                                  <span className="text-sm tracking-widest uppercase text-white font-light">
                                    {slide.badgeText}
                                  </span>
                                </div>
                              )}

                              {slide.titleText && (
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white mb-6 drop-shadow-2xl">
                                  {slide.titleText}
                                </h1>
                              )}

                              {(slide.descText || subheadline) && (
                                <p className="text-lg md:text-xl text-white/95 font-light tracking-wide max-w-2xl mx-auto mb-8 drop-shadow-lg">
                                  {slide.descText || subheadline}
                                </p>
                              )}

                              <div className="flex items-center justify-center gap-4 flex-wrap">
                                {primaryCta && (
                                  <button
                                    className={btnPrimary}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      go(primaryCta.href);
                                    }}
                                  >
                                    {primaryCta.label}
                                  </button>
                                )}
                                {secondaryCta && (
                                  <button
                                    className={btnOutlineLight}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      go(secondaryCta.href);
                                    }}
                                  >
                                    {secondaryCta.label}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Elegant Navigation Arrows */}
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-6 md:px-12">
              <button
                aria-label="Previous"
                className="pointer-events-auto h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 grid place-items-center group"
                type="button"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" />
              </button>
              <button
                aria-label="Next"
                className="pointer-events-auto h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 grid place-items-center group"
                type="button"
                onClick={scrollNext}
              >
                <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        ) : (
          // Static background mode
          <div className="relative h-[75vh] min-h-[600px] w-full">
            {backgroundImage && (
              <>
                <Image fill priority alt={headline} className="object-cover" sizes="100vw" src={backgroundImage} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
              </>
            )}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                backgroundImage ? "text-white" : "text-foreground"
              )}
            >
              <div className="text-center px-6 max-w-4xl">
                {badge && (
                  <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/30 rounded-full">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-sm tracking-widest uppercase text-white font-light">
                      {badge}
                    </span>
                  </div>
                )}

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6 drop-shadow-2xl">
                  {headline}
                </h1>

                {subheadline && (
                  <p className={cn(
                    "text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto mb-8 drop-shadow-lg",
                    backgroundImage ? "text-white/95" : "text-muted-foreground"
                  )}>
                    {subheadline}
                  </p>
                )}

                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {primaryCta && (
                    <button className={btnPrimary} type="button" onClick={() => go(primaryCta.href)}>
                      {primaryCta.label}
                    </button>
                  )}
                  {secondaryCta && (
                    <button
                      className={backgroundImage ? btnOutlineLight : btnSecondary}
                      type="button"
                      onClick={() => go(secondaryCta.href)}
                    >
                      {secondaryCta.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Featured Category Tiles - Fashion Style */}
      {tiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {tiles.slice(0, 2).map((tile, i) => (
            <div
              key={i}
              aria-label={tile.titleText}
              className="group relative overflow-hidden cursor-pointer aspect-[4/3] md:aspect-[16/10]"
              role="link"
              tabIndex={0}
              onClick={() => go(tile.href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  go(tile.href);
                }
              }}
            >
              {/* Image with parallax effect */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  fill
                  alt={tile.titleText}
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                  src={tile.imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/70" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-transform duration-500 group-hover:translate-y-[-8px]">
                <h3 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-2 drop-shadow-lg">
                  {tile.titleText}
                </h3>
                {tile.subtitleText && (
                  <p className="text-sm md:text-base tracking-widest uppercase text-white/90 font-light drop-shadow">
                    {tile.subtitleText}
                  </p>
                )}

                {/* Decorative underline */}
                <div className="mt-4 w-16 h-px bg-white/50 transition-all duration-500 group-hover:w-24 group-hover:bg-white" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
