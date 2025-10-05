'use client'
import type { HeroCategoryGridData, Locale } from "@/types/tenant";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

interface HeroCategoryGridProps {
  data: HeroCategoryGridData;
  locale: Locale;
}

export default function HeroCategoryGrid({ data, locale }: HeroCategoryGridProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 md:py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 space-y-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white">
            {t(data.headline, locale)}
          </h1>
          {data.subheadline && (
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t(data.subheadline, locale)}
            </p>
          )}
        </div>

        {/* Category Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {data.categories.map((category, index) => (
            <Link
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              href={category.href}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
                <Image
                  alt={t(category.name, locale)}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  src={category.imageUrl}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Badge if present */}
                {category.badge && (
                  <div className="absolute top-4 right-4 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    {t(category.badge, locale)}
                  </div>
                )}
              </div>

              {/* Category name */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-brand-primary transition-colors">
                  {t(category.name, locale)}
                </h3>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 border-2 border-brand-primary opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 pointer-events-none" />
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        {data.cta && (
          <div className={`text-center mt-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <Button
              asChild
              className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Link href={data.cta.href}>
                {t(data.cta.label, locale)}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
