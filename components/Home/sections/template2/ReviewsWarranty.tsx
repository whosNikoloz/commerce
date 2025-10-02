import type { ReviewsWarrantyData, Locale } from "@/types/tenant";
import { t } from "@/lib/i18n";
import { Star, Shield } from "lucide-react";

interface ReviewsWarrantyProps {
  data: ReviewsWarrantyData;
  locale: Locale;
}

export default function ReviewsWarranty({
  data,
  locale,
}: ReviewsWarrantyProps) {
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          {t(data.title, locale)}
        </h2>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {data.reviews.map((review, idx) => (
              <div
                key={idx}
                className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-6"
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

                <div className="border-t border-emerald-200 dark:border-emerald-900 pt-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {review.author}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.date).toLocaleDateString(locale)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-900 dark:to-emerald-950 rounded-lg p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 p-3 rounded-full">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">
                {t(data.warrantyInfo.title, locale)}
              </h3>
            </div>

            <ul className="space-y-4">
              {data.warrantyInfo.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-emerald-50">{t(detail, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}