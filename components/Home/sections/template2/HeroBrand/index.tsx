import type { HeroBrandData, Locale } from "@/types/tenant";

import HeroBrandClient from "./HeroBrandClient";

import { t, tOpt } from "@/lib/i18n";

interface HeroBrandProps {
  data: HeroBrandData;
  locale: Locale;
}

export default async function HeroBrand({ data, locale }: HeroBrandProps) {
  // No network fetches required here (mirrors your Template-1 Hero style).
  const headline = t(data.headline, locale);
  const subheadline = data.subheadline ? tOpt(data.subheadline, locale) : undefined;
  const badge = data.badge ? tOpt(data.badge, locale) : undefined;

  // Pre-localize slides/tiles so the client stays dumb & fast.
  const slides =
    data.slides?.map((s) => ({
      ...s,
      altText: t(s.alt, locale),
      badgeText: s.badge ? tOpt(s.badge, locale) : undefined,
      titleText: s.title ? tOpt(s.title, locale) : undefined,
      descText: s.description ? tOpt(s.description, locale) : undefined,
    })) ?? [];

  const tiles =
    data.tiles?.map((tile) => ({
      ...tile,
      titleText: t(tile.title, locale),
      subtitleText: tile.subtitle ? tOpt(tile.subtitle, locale) : undefined,
    })) ?? [];

  return (
    <section className="relative ">
      <div className="container mx-auto px-4 lg:px-8">
        <HeroBrandClient
          backgroundImage={data.backgroundImage}
          badge={badge}
          headline={headline}
          primaryCta={data.primaryCta ? { ...data.primaryCta, label: t(data.primaryCta.label, locale) } : undefined}
          secondaryCta={data.secondaryCta ? { ...data.secondaryCta, label: t(data.secondaryCta.label, locale) } : undefined}
          slides={slides}
          subheadline={subheadline}
          tiles={tiles}
        />
      </div>
    </section>
  );
}
