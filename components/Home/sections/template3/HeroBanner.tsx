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
    <section className="relative h-[500px] md:h-[650px] overflow-hidden group">
      <picture>
        {data.mobileBackgroundImage && (
          <source
            media="(max-width: 768px)"
            srcSet={data.mobileBackgroundImage}
          />
        )}
        <div
          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url(${data.backgroundImage})` }}
        />
      </picture>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

      <div className="relative z-10 container mx-auto px-6 md:px-8 h-full flex items-center">
        <div className="max-w-xl text-white space-y-6">
          {data.badge && (
            <div className="inline-block bg-brand-primary/10 border border-brand-primary/20 px-4 py-1.5 rounded-full text-sm font-semibold text-brand-primary backdrop-blur-sm">
              {tOpt(data.badge, locale)}
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            {t(data.headline, locale)}
          </h1>

          {data.subheadline && (
            <p className="text-lg md:text-xl text-white/90">
              {tOpt(data.subheadline, locale)}
            </p>
          )}

          {data.cta && (
            <div className="pt-2">
              <Button
                asChild
                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold"
                size="lg"
              >
                <Link href={data.cta.href}>{t(data.cta.label, locale)}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}