import type { ReviewsWarrantyData, Locale } from "@/types/tenant";
import { t } from "@/lib/i18n";
import { Star, Shield } from "lucide-react";

interface ReviewsWarrantyProps {
  data: ReviewsWarrantyData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default function ReviewsWarranty({
  data,
  locale,
  template = 2,
}: ReviewsWarrantyProps) {
  return (
    <section className="py-16 bg-background dark:bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 text-foreground">
          {t(data.title, locale)}
        </h2>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {data.reviews.map((review, idx) => (
              <div
                key={idx}
                className="bg-home-comfort/20 dark:bg-home-elegant/20 rounded-lg p-6 animate-home-sway"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <Star
                      key={starIdx}
                      className={`h-5 w-5 ${
                        starIdx < review.rating
                          ? "fill-home-warm text-home-warm"
                          : "text-muted dark:text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-text-light dark:text-text-lightdark mb-4 leading-relaxed">
                  &quot;{t(review.text, locale)}&quot;
                </p>

                <div className="border-t border-home-comfort/30 dark:border-home-elegant/30 pt-4">
                  <p className="font-semibold text-foreground">
                    {review.author}
                  </p>
                  <p className="text-sm text-text-subtle dark:text-text-subtledark">
                    {new Date(review.date).toLocaleDateString(locale)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-home-warm to-home-modern dark:from-home-elegant dark:to-home-modern rounded-lg p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 p-3 rounded-full animate-home-sway">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-heading font-bold">
                {t(data.warrantyInfo.title, locale)}
              </h3>
            </div>

            <ul className="space-y-4">
              {data.warrantyInfo.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-home-comfort/90">{t(detail, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}