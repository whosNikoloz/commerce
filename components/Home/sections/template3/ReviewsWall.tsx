import type { ReviewsWallData, Locale } from "@/types/tenant";

import Image from "next/image";
import { Star, BadgeCheck } from "lucide-react";

import { t, tOpt } from "@/lib/i18n";

interface ReviewsWallProps {
  data: ReviewsWallData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default function ReviewsWall({ data, locale, template = 3 }: ReviewsWallProps) {
  return (
    <section className="py-16 bg-background dark:bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 text-foreground dark:text-foreground">
          {t(data.title, locale)}
        </h2>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {data.reviews.map((review, idx) => (
            <div
              key={idx}
              className="break-inside-avoid bg-beauty-spa/10 dark:bg-beauty-spa/20 rounded-lg p-6 border border-beauty-spa/20 dark:border-beauty-spa/30 hover:border-beauty-spa dark:hover:border-beauty-spa transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                {review.avatar && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-beauty-bloom dark:border-beauty-bloom">
                    <Image
                      fill
                      alt={review.author}
                      className="object-cover"
                      src={review.avatar}
                    />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground dark:text-foreground">
                      {review.author}
                    </p>
                    {review.verified && (
                      <BadgeCheck className="h-4 w-4 text-beauty-bloom dark:text-beauty-bloom" />
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className={`h-4 w-4 ${starIdx < review.rating
                            ? "fill-beauty-luxury text-beauty-luxury"
                            : "text-muted dark:text-muted"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-text-light dark:text-text-lightdark mb-3 leading-relaxed">
                &quot;{t(review.text, locale)}&quot;
              </p>

              {review.productName && (
                <p className="text-sm text-beauty-bloom dark:text-beauty-bloom font-medium">
                  {tOpt(review.productName, locale)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}