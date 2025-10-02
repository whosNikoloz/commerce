import type { HeroWithSearchData, Locale } from "@/types/tenant"

import { Search, Sparkles } from "lucide-react"

import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeroWithSearchProps {
  data: HeroWithSearchData
  locale: Locale
}

export default function HeroWithSearch({ data, locale }: HeroWithSearchProps) {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 dark:from-blue-900 dark:via-indigo-950 dark:to-black py-24 md:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.2),transparent_50%)]" />

      {data.imageUrl && (
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: `url(${data.imageUrl})` }}
        />
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {data.promoBadge && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-5 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
              <Sparkles className="h-4 w-4" />
              {t(data.promoBadge, locale)}
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight text-balance tracking-tight">
            {t(data.headline, locale)}
          </h1>

          <p className="text-xl md:text-2xl text-blue-50 max-w-2xl mx-auto text-pretty leading-relaxed">
            {t(data.subheadline, locale)}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-10">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                className="pl-12 h-14 text-lg bg-white dark:bg-gray-950 border-2 border-transparent focus:border-white shadow-xl focus:shadow-2xl transition-all"
                placeholder={t(data.searchPlaceholder, locale)}
                type="search"
              />
            </div>
            <Button
              className="h-14 px-8 bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              size="lg"
            >
              {t(data.searchPlaceholder, locale)}
            </Button>
          </div>

          {data.cta && (
            <Button
              className="mt-6 border-2 border-white/80 text-white hover:bg-white/10 backdrop-blur-sm font-semibold shadow-lg hover:shadow-xl transition-all bg-transparent"
              size="lg"
              variant="outline"
            >
              {t(data.cta.label, locale)}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
