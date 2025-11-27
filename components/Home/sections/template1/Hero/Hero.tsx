import type { HeroData, Locale } from "@/types/tenant"

import HeroClient from "./HeroClient"

interface HeroProps {
  data: HeroData
  locale: Locale
}

export default async function Hero({ data, locale }: HeroProps) {
  return (
    <section className="relative w-full to-muted/20 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="w-full">
          <HeroClient data={data} locale={locale} />
        </div>
      </div>
    </section>
  )
}
