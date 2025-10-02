import type { HeroLifestyleData, Locale } from "@/types/tenant";

import Link from "next/link";

import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface HeroLifestyleProps {
  data: HeroLifestyleData;
  locale: Locale;
}

export default function HeroLifestyle({ data, locale }: HeroLifestyleProps) {
  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${data.imageUrl})` }}
      />

      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: data.overlayOpacity || 0.4 }}
      />

      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {t(data.headline, locale)}
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-gray-100">
            {t(data.subheadline, locale)}
          </p>

          <div className="flex flex-wrap gap-4">
            {data.cta && (
              <Button asChild className="text-lg px-8" size="lg">
                <Link href={data.cta.href}>{t(data.cta.label, locale)}</Link>
              </Button>
            )}
            {data.secondaryCta && (
              <Button
                asChild
                className="text-lg px-8 border-white text-white hover:bg-white hover:text-gray-900"
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