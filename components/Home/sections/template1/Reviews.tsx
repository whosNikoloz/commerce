import type { ReviewsData, Locale } from "@/types/tenant";

import { Star } from "lucide-react";

import { t, tOpt } from "@/lib/i18n";

interface ReviewsProps {
  data: ReviewsData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default function Reviews({ data, locale, template = 1 }: ReviewsProps) {
  return (
    <section className="py-16 bg-brand-surface dark:bg-brand-surfacedark">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-12 text-text-light dark:text-text-lightdark">
          {t(data.title, locale)}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {data.reviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-card dark:bg-card rounded-lg p-6 shadow-md border border-border"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, starIdx) => (
                  <Star
                    key={starIdx}
                    className={`h-5 w-5 ${
                      starIdx < review.rating
                        ? "fill-tech-neon text-tech-neon"
                        : "text-brand-muted dark:text-brand-muteddark"
                    }`}
                  />
                ))}
              </div>

              <p className="text-text-subtle dark:text-text-subtledark mb-4 leading-relaxed">
                &quot;{t(review.text, locale)}&quot;
              </p>

              <div className="border-t border-border pt-4">
                <p className="font-semibold text-text-light dark:text-text-lightdark">
                  {review.author}
                </p>
                <p className="text-sm text-text-subtle dark:text-text-subtledark mt-1">
                  {new Date(review.date).toLocaleDateString(locale)}
                </p>
                {review.productName && (
                  <p className="text-sm text-brand-primary dark:text-brand-primary mt-1">
                    {tOpt(review.productName, locale)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}