"use client";

import { useRef, useState, useEffect } from "react";
import { Splide, SplideSlide, Splide as SplideCore } from "@splidejs/react-splide";

import { ProductCard } from "./ProductCard";
import '@splidejs/react-splide/css';

type Props = {
  products: any[];
  columns?: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CarouselRail({ products, columns: _columns = 4 }: Props) {
  const splideRef = useRef<SplideCore | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_canGoPrev, setCanGoPrev] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_canGoNext, setCanGoNext] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const perPageDesktop = 5;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const splide = splideRef.current?.splide;

    if (!splide) return;

    const updateArrows = () => {
      const index = splide.index;
      const length = splide.length;
      const perPage = splide.options.perPage || 1;

      setCanGoPrev(index > 0);
      setCanGoNext(index < length - perPage);
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
  }, []);

  // Don't show carousel for very few items
  if (products.length <= perPageDesktop) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {products.map((p, index) => (
          <div key={p.id} className="h-full">
            <ProductCard priority={index < 4} product={p} showActions={true} size="compact" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative group">
      {/* Navigation Buttons - Show on hover */}
      {/* {canGoPrev && (
        <button
          aria-label="Previous"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-border shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 disabled:opacity-0"
          type="button"
          onClick={() => splideRef.current?.go("<")}
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
      )}

      {canGoNext && (
        <button
          aria-label="Next"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-border shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-2 disabled:opacity-0"
          type="button"
          onClick={() => splideRef.current?.go(">")}
        >
          <ArrowRight className="h-5 w-5 text-black" />
        </button>
      )} */}

      {!isIntersecting ? (
        <div className="h-80 animate-pulse bg-muted rounded-lg" />
      ) : (
        <Splide
          ref={splideRef as any}
          aria-label="Products"
          options={{
            type: "slide",
            perPage: perPageDesktop,
            gap: "0.75rem",
            pagination: false,
            arrows: true,
            drag: true,
            trimSpace: true,
            snap: true,
            omitEnd: false,
            focus: 0,
            perMove: 10,
            flickPower: 300,
            breakpoints: {
              2000: { perPage: perPageDesktop, gap: "0.75rem" },
              1536: { perPage: 6, gap: "0.75rem" },
              1280: { perPage:5, gap: "0.75rem" },
              1024: { perPage: 4, gap: "0.75rem" },
              768: { perPage: 4, gap: "0.5rem" },
              640: { perPage: 3, gap: "0.5rem" },
              480: { perPage: 2, gap: "0.5rem" },
            },


          }}
        >
          {products.map((p, index) => (
            <SplideSlide key={p.id}>
              <ProductCard priority={index < 6} product={p} showActions={true} size="compact" />
            </SplideSlide>
          ))}
        </Splide>
      )}
    </div>
  );
}
