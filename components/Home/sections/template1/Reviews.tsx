import type { ReviewsData, Locale } from "@/types/tenant";

import { Star } from "lucide-react";

import { t, tOpt } from "@/lib/i18n";

interface ReviewsProps {
  data: ReviewsData;
  locale: Locale;
}

export default function Reviews({ data, locale }: ReviewsProps) {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          {t(data.title, locale)}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {data.reviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-950 rounded-lg p-6 shadow-md"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, starIdx) => (
                  <Star
                    key={starIdx}
                    className={`h-5 w-5 ${
                      starIdx < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-700"
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                &quot;{t(review.text, locale)}&quot;
              </p>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {review.author}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(review.date).toLocaleDateString(locale)}
                </p>
                {review.productName && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
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