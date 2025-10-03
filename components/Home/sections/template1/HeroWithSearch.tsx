import { ArrowRight, Search, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HeroWithSearchData, Locale } from "@/types/tenant"
import { t } from "@/lib/i18n"

interface HeroWithSearchProps {
  data: HeroWithSearchData
  locale: Locale
}

export default function HeroWithSearch({ data, locale }: HeroWithSearchProps) {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Hero Content */}
      <div className="container mx-auto px-6 pt-32 pb-20 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <div className="space-y-8">
            {data.promoBadge && (
              <div className="inline-block">
                <p className="text-sm uppercase tracking-widest text-accent font-mono">
                  {t(data.promoBadge, locale)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif leading-[0.95] text-balance text-foreground">
                {t(data.headline, locale)}
              </h1>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl text-pretty">
              {t(data.subheadline, locale)}
            </p>

            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                className="pl-12 h-14 text-base bg-card border-border"
                placeholder={t(data.searchPlaceholder, locale)}
                type="search"
              />
            </div>

            {data.cta && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="gap-2 text-base" size="lg">
                  <a href={data.cta.href}>
                    {t(data.cta.label, locale)}
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            )}

            <div className="flex items-center gap-8 pt-8 border-t border-border">
              <div>
                <p className="text-3xl font-semibold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Premium Products</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-foreground">4.9</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Right Content - Product Showcase */}
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border">
              <img
                alt={t(data.headline, locale)}
                className="w-full h-full object-cover"
                src={data.imageUrl || "/hero/hero-tech.jpg"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

              {/* Floating Product Card */}
              <div className="absolute bottom-8 left-8 right-8 bg-card/90 backdrop-blur-xl border border-border rounded-xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">Quantum Pro X</h3>
                    <p className="text-sm text-muted-foreground">Next-gen flagship device</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">$1,299</p>
                    <p className="text-xs text-accent">In Stock</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Scroll to Explore</p>
        <div className="w-px h-12 bg-gradient-to-b from-accent to-transparent" />
      </div>
    </div>
  )
}
