import type { BrandStoryData, Locale } from "@/types/tenant";

import Image from "next/image";

import { t } from "@/lib/i18n";

interface BrandStoryProps {
  data: BrandStoryData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default function BrandStory({ data, locale, template = 2 }: BrandStoryProps) {
  return (
    <section className="py-16 bg-home-comfort/20 dark:bg-home-elegant/10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                {t(data.title, locale)}
              </h2>

              <div
                dangerouslySetInnerHTML={{ __html: t(data.story, locale) }}
                className="prose prose-lg dark:prose-invert text-text-light dark:text-text-lightdark"
              />

              {data.stats && (
                <div className="grid grid-cols-3 gap-6 mt-8">
                  {data.stats.map((stat, idx) => (
                    <div key={idx} className="text-center animate-home-sway" style={{ animationDelay: `${idx * 0.2}s` }}>
                      <div className="text-3xl font-bold text-home-warm dark:text-home-comfort">
                        {stat.value}
                      </div>
                      <div className="text-sm text-text-subtle dark:text-text-subtledark mt-1">
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