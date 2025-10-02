import type { HeroBannerData, Locale } from "@/types/tenant";

import Link from "next/link";

import { t, tOpt } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  data: HeroBannerData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default function HeroBanner({ data, locale, template = 3 }: HeroBannerProps) {
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

      <div className="absolute inset-0 bg-gradient-to-r from-beauty-natural/80 via-transparent to-transparent dark:from-beauty-luxury/70" />

      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl text-white animate-beauty-pulse">
          {data.badge && (
            <div className="inline-block bg-beauty-bloom px-4 py-1.5 rounded-full text-sm font-semibold mb-4 text-white shadow-lg">
              {tOpt(data.badge, locale)}
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight font-heading text-balance">
            {t(data.headline, locale)}
          </h1>

          {data.subheadline && (
            <p className="text-xl md:text-2xl mb-8 text-text-light dark:text-text-lightdark text-pretty">
              {tOpt(data.subheadline, locale)}
            </p>
          )}

          {data.cta && (
            <Button asChild className="text-lg px-8 bg-beauty-bloom hover:bg-beauty-luxury transition-all hover:scale-105 shadow-xl" size="lg">
              <Link href={data.cta.href}>{t(data.cta.label, locale)}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}