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
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black py-20 md:py-32 overflow-hidden">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse delay-700" />
      </div>

      {data.imageUrl && (
        <div
          className="absolute inset-0 opacity-5 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: `url(${data.imageUrl})` }}
        />
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {data.promoBadge && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-emerald-500/50 transition-all hover:scale-105">
              <Sparkles className="h-4 w-4" />
              {t(data.promoBadge, locale)}
            </div>
          )}

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight text-balance tracking-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              {t(data.headline, locale)}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto text-pretty leading-relaxed">
            {t(data.subheadline, locale)}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mt-12">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary z-10" />
              <Input
                className="pl-14 pr-4 h-16 text-base bg-white/10 backdrop-blur-md border-2 border-white/20 focus:border-brand-primary/50 text-white placeholder:text-slate-400 shadow-2xl focus:shadow-brand-primary/20 transition-all rounded-2xl"
                placeholder={t(data.searchPlaceholder, locale)}
                type="search"
              />
            </div>
            <Button
              className="h-16 px-10 bg-gradient-to-r from-brand-primary to-purple-600 hover:from-brand-primary/90 hover:to-purple-700 text-white font-bold shadow-2xl shadow-brand-primary/30 hover:shadow-brand-primary/50 transition-all hover:scale-105 rounded-2xl border-0"
              size="lg"
            >
              Search
            </Button>
          </div>

          {data.cta && (
            <div className="mt-8 flex justify-center gap-4">
              <Button
                className="border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/50 font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl px-8"
                size="lg"
                variant="outline"
              >
                {t(data.cta.label, locale)}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
