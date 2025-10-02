import type { HeroBannerData, Locale } from "@/types/tenant";

import Link from "next/link";

import { t, tOpt } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  data: HeroBannerData;
  locale: Locale;
}

export default function HeroBanner({ data, locale }: HeroBannerProps) {
  return (
    <section className="relative h-[500px] md:h-[650px] overflow-hidden">
      <picture>
        {data.mobileBackgroundImage && (
          <source
            media="(max-width: 768px)"
            srcSet={data.mobileBackgroundImage}
          />
        )}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${data.backgroundImage})` }}
        />
      </picture>

      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl text-white">
          {data.badge && (
            <div className="inline-block bg-purple-500 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              {tOpt(data.badge, locale)}
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            {t(data.headline, locale)}
          </h1>

          {data.subheadline && (
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              {tOpt(data.subheadline, locale)}
            </p>
          )}

          {data.cta && (
            <Button asChild className="text-lg px-8" size="lg">
              <Link href={data.cta.href}>{t(data.cta.label, locale)}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}