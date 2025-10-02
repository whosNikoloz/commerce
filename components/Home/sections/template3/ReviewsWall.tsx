import type { ReviewsWallData, Locale } from "@/types/tenant";

import Image from "next/image";
import { Star, BadgeCheck } from "lucide-react";

import { t, tOpt } from "@/lib/i18n";

interface ReviewsWallProps {
  data: ReviewsWallData;
  locale: Locale;
}

export default function ReviewsWall({ data, locale }: ReviewsWallProps) {
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          {t(data.title, locale)}
        </h2>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {data.reviews.map((review, idx) => (
            <div
              key={idx}
              className="break-inside-avoid bg-purple-50 dark:bg-purple-950/20 rounded-lg p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                {review.avatar && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
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
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.author}
                    </p>
                    {review.verified && (
                      <BadgeCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className={`h-4 w-4 ${starIdx < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-700"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                &quot;{t(review.text, locale)}&quot;
              </p>

              {review.productName && (
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
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