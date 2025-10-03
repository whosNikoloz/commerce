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
    <section className="relative h-[600px] md:h-[700px] overflow-hidden rounded-2xl mx-4 my-8 group">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
        style={{ backgroundImage: `url(${data.imageUrl})` }}
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent"
        style={{ opacity: data.overlayOpacity || 0.6 }}
      />

      <div className="relative z-10 container mx-auto px-6 md:px-8 h-full flex items-center">
        <div className="max-w-2xl text-white space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            {t(data.headline, locale)}
          </h1>

          <p className="text-lg md:text-xl text-white/90">
            {t(data.subheadline, locale)}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            {data.cta && (
              <Button
                asChild
                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold"
                size="lg"
              >
                <Link href={data.cta.href}>{t(data.cta.label, locale)}</Link>
              </Button>
            )}
            {data.secondaryCta && (
              <Button
                asChild
                className="border-2 border-white text-white hover:bg-white hover:text-black backdrop-blur-sm"
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