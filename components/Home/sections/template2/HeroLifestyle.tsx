import type { HeroLifestyleData, Locale } from "@/types/tenant";

import Link from "next/link";

import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface HeroLifestyleProps {
  data: HeroLifestyleData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default function HeroLifestyle({ data, locale, template = 2 }: HeroLifestyleProps) {
  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden rounded-3xl mx-4 my-8 shadow-2xl">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${data.imageUrl})` }}
      />

      <div
        className="absolute inset-0 bg-gradient-to-br from-home-modern/80 via-transparent to-home-elegant/60"
        style={{ opacity: data.overlayOpacity || 0.5 }}
      />

      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white animate-home-sway">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight font-heading text-balance">
            {t(data.headline, locale)}
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-text-light dark:text-text-lightdark text-pretty">
            {t(data.subheadline, locale)}
          </p>

          <div className="flex flex-wrap gap-4">
            {data.cta && (
              <Button asChild className="text-lg px-8 bg-home-warm hover:bg-home-elegant transition-all hover:scale-105 shadow-xl" size="lg">
                <Link href={data.cta.href}>{t(data.cta.label, locale)}</Link>
              </Button>
            )}
            {data.secondaryCta && (
              <Button
                asChild
                className="text-lg px-8 border-2 border-white text-white hover:bg-white hover:text-home-modern backdrop-blur-sm transition-all"
                size="lg"
                variant="outline"
              >
                <Link href={data.secondaryCta.href}>
                  {t(data.secondaryCta.label, locale)}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}