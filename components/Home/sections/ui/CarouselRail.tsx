"use client";

import { useRef, useState, useEffect, useMemo, memo } from "react";
import { Splide, SplideSlide, Splide as SplideCore } from "@splidejs/react-splide";

import { ProductCard } from "./ProductCard";
import '@splidejs/react-splide/css';

type Props = {
  products: any[];
  columns?: number;
};

const perPageDesktop = 5;

// Memoize splide options outside component to avoid recreation
const SPLIDE_OPTIONS = {
  type: "slide" as const,
  perPage: perPageDesktop,
  gap: "0.75rem",
  pagination: false,
  arrows: true,
  drag: true,
  trimSpace: true,
  snap: true,
  omitEnd: false,
  focus: 0 as const,
  perMove: 10,
  flickPower: 300,
  breakpoints: {
    2000: { perPage: perPageDesktop, gap: "0.75rem" },
    1536: { perPage: 6, gap: "0.75rem" },
    1280: { perPage: 5, gap: "0.75rem" },
    1024: { perPage: 4, gap: "0.75rem" },
    768: { perPage: 4, gap: "0.5rem" },
    640: { perPage: 3, gap: "0.5rem" },
    480: { perPage: 2, gap: "0.5rem" },
  },
};

function CarouselRailInner({ products, columns: _columns = 4 }: Props) {
  const splideRef = useRef<SplideCore | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }  // Increased for earlier loading
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Memoize grid items for when we use static grid
  const gridItems = useMemo(() =>
    products.map((p, index) => (
      <div key={p.id} className="h-full">
        <ProductCard priority={index < 4} product={p} showActions={true} size="compact" />
      </div>
    )), [products]
  );

  // Memoize carousel slides
  const carouselSlides = useMemo(() =>
    products.map((p, index) => (
      <SplideSlide key={p.id}>
        <ProductCard priority={index < 6} product={p} showActions={true} size="compact" />
      </SplideSlide>
    )), [products]
  );

  // Don't show carousel for very few items
  if (products.length <= perPageDesktop) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {gridItems}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative group">
      {!isIntersecting ? (
        <div className="h-80 animate-pulse bg-muted rounded-lg" />
      ) : (
        <Splide
          ref={splideRef as any}
          aria-label="Products"
          options={SPLIDE_OPTIONS}
        >
          {carouselSlides}
        </Splide>
      )}
    </div>
  );
}

// Memoize the entire carousel component
const CarouselRail = memo(CarouselRailInner, (prevProps, nextProps) => {
  // Only re-render if products array changes (by reference or length)
  if (prevProps.products === nextProps.products) return true;
  if (prevProps.products.length !== nextProps.products.length) return false;
  // Check if product IDs are the same (shallow comparison)
  for (let i = 0; i < prevProps.products.length; i++) {
    if (prevProps.products[i]?.id !== nextProps.products[i]?.id) return false;
  }

  return true;
});

CarouselRail.displayName = "CarouselRail";

export default CarouselRail;
