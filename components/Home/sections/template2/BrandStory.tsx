import type { BrandStoryData, Locale } from "@/types/tenant";

import Image from "next/image";

import { t } from "@/lib/i18n";

interface BrandStoryProps {
  data: BrandStoryData;
  locale: Locale;
}

export default function BrandStory({ data, locale }: BrandStoryProps) {
  return (
    <section className="py-16 bg-emerald-50 dark:bg-emerald-950/10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t(data.title, locale)}
              </h2>

              <div
                dangerouslySetInnerHTML={{ __html: t(data.story, locale) }}
                className="prose prose-lg dark:prose-invert text-gray-700 dark:text-gray-300"
              />

              {data.stats && (
                <div className="grid grid-cols-3 gap-6 mt-8">
                  {data.stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t(stat.label, locale)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              {data.imageUrl && (
                <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    fill
                    alt={t(data.title, locale)}
                    className="object-cover"
                    src={data.imageUrl}
                  />
                </div>
              )}

              {data.videoUrl && !data.imageUrl && (
                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  {/* <video
                    src={data.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  /> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}