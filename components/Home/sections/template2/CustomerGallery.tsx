import type { CustomerGalleryData, Locale } from "@/types/tenant";

import Image from "next/image";
import { Instagram } from "lucide-react";

import { t, tOpt } from "@/lib/i18n";

interface CustomerGalleryProps {
  data: CustomerGalleryData;
  locale: Locale;
}

export default function CustomerGallery({
  data,
  locale,
}: CustomerGalleryProps) {
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t(data.title, locale)}
          </h2>
          {data.subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {tOpt(data.subtitle, locale)}
            </p>
          )}
          {data.hashtag && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Instagram className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {tOpt(data.hashtag, locale)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.images.map((image, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              <Image
                fill
                alt={image.caption ? t(image.caption, locale) : `Gallery ${idx + 1}`}
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                src={image.url}
              />

              {(image.caption || image.author) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    {image.caption && (
                      <p className="text-sm mb-1">{t(image.caption, locale)}</p>
                    )}
                    {image.author && (
                      <p className="text-xs text-gray-300">by {image.author}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}