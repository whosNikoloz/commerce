'use client'
import type { CommercialBannerData, Locale } from "@/types/tenant";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { t } from "@/lib/i18n";

interface CommercialBannerProps {
  data: CommercialBannerData;
  locale: Locale;
}

export default function CommercialBanner({ data, locale }: CommercialBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          className={`group relative block overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          href={data.href}
        >
          {/* Desktop Image */}
          <div className="relative hidden md:block h-64 lg:h-80 xl:h-96">
            <Image
              alt={t(data.alt, locale)}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              fill
              priority
              sizes="100vw"
              src={data.imageUrl}
            />
          </div>

          {/* Mobile Image */}
          <div className="relative block md:hidden h-48">
            <Image
              alt={t(data.alt, locale)}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              fill
              priority
              sizes="100vw"
              src={data.mobileImageUrl || data.imageUrl}
            />
          </div>

          {/* Badge overlay */}
          {data.badge && (
            <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-brand-primary text-white text-sm md:text-base font-bold px-4 py-2 rounded-full shadow-lg animate-pulse">
              {t(data.badge, locale)}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />

          {/* Decorative border on hover */}
          <div className="absolute inset-0 border-4 border-brand-primary opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none" />
        </Link>
      </div>
    </section>
  );
}
