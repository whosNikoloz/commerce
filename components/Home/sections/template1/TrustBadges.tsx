import type { TrustBadgesData, Locale } from "@/types/tenant"
import { t } from "@/lib/i18n"
import { Shield, Truck, CreditCard, Headphones } from "lucide-react"

interface TrustBadgesProps {
  data: TrustBadgesData
  locale: Locale
  template?: 1 | 2 | 3
}

const iconMap: Record<string, any> = {
  shield: Shield,
  truck: Truck,
  creditCard: CreditCard,
  headphones: Headphones,
}

export default function TrustBadges({ data, locale, template = 1 }: TrustBadgesProps) {
  return (
    <section className="py-16 border-y border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {data.badges.map((badge, idx) => {
            const Icon = iconMap[badge.icon] || Shield

            return (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className="bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-primary/10 dark:to-brand-primary/20 p-5 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Icon className="h-8 w-8 text-brand-primary dark:text-brand-primary" />
                </div>
                <h3 className="font-bold font-heading text-base text-text-light dark:text-text-lightdark mb-2">
                  {t(badge.title, locale)}
                </h3>
                <p className="text-sm text-text-subtle dark:text-text-subtledark leading-relaxed">
                  {t(badge.description, locale)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
