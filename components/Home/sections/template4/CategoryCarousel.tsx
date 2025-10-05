'use client'
import type { CategoryCarouselData, Locale } from "@/types/tenant";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

interface CategoryCarouselProps {
  data: CategoryCarouselData;
  locale: Locale;
}

export default function CategoryCarousel({ data, locale }: CategoryCarouselProps) {
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of card + gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative py-12 md:py-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`flex items-center justify-between mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            {t(data.title, locale)}
          </h2>

          {/* Navigation Buttons */}
          <div className="hidden md:flex gap-2">
            <Button
              className="rounded-full w-10 h-10 p-0 bg-white dark:bg-slate-800 hover:bg-brand-primary hover:text-white transition-all shadow-md"
              variant="outline"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              className="rounded-full w-10 h-10 p-0 bg-white dark:bg-slate-800 hover:bg-brand-primary hover:text-white transition-all shadow-md"
              variant="outline"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className={`flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {data.categories.map((category, index) => (
              <Link
                key={index}
                className="group flex-shrink-0 w-72 snap-start"
                href={category.href}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      alt={t(category.name, locale)}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      fill
                      sizes="320px"
                      src={category.imageUrl}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors mb-2">
                      {t(category.name, locale)}
                    </h3>
                    {category.productCount !== undefined && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {category.productCount} {locale === 'ka' ? 'პროდუქტი' : 'products'}
                      </p>
                    )}
                  </div>

                  {/* Hover border */}
                  <div className="absolute inset-0 border-2 border-brand-primary opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 pointer-events-none" />
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile scroll indicators */}
          <div className="flex md:hidden justify-center gap-2 mt-6">
            {data.categories.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
