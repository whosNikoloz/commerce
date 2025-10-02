import type { InfluencerHighlightData, Locale } from "@/types/tenant";

import Image from "next/image";
import { Play, Instagram } from "lucide-react";

import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";


interface InfluencerHighlightProps {
  data: InfluencerHighlightData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default function InfluencerHighlight({
  data,
  locale,
  template = 3,
}: InfluencerHighlightProps) {
  return (
    <section className="py-16 bg-gradient-to-br from-beauty-natural/20 to-beauty-bloom/20 dark:from-beauty-natural/10 dark:to-beauty-bloom/10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4 text-foreground dark:text-foreground">
          {t(data.title, locale)}
        </h2>

        {data.influencer && (
          <div className="flex items-center justify-center gap-3 mb-8">
            {data.influencer.avatar && (
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-beauty-bloom dark:border-beauty-bloom animate-beauty-pulse">
                <Image
                  fill
                  alt={data.influencer.name}
                  className="object-cover"
                  src={data.influencer.avatar}
                />
              </div>
            )}
            <div className="text-center">
              <p className="font-bold text-foreground dark:text-foreground">
                {data.influencer.name}
              </p>
              <p className="text-sm text-beauty-bloom dark:text-beauty-bloom flex items-center gap-1">
                <Instagram className="h-4 w-4" />
                {data.influencer.handle}
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {data.videoUrl && (
            <div className="md:col-span-2">
              <div className="aspect-video relative rounded-2xl overflow-hidden shadow-2xl group">
                {/* <video
                  controls
                  className="w-full h-full object-cover"
                  poster={data.images[0]}
                  src={data.videoUrl}
                /> */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Play className="h-16 w-16 text-white animate-beauty-pulse" />
                </div>
              </div>
            </div>
          )}

          {data.images.slice(data.videoUrl ? 1 : 0).map((image, idx) => (
            <div
              key={idx}
              className="aspect-square relative rounded-2xl overflow-hidden shadow-lg group border-2 border-beauty-spa/30 dark:border-beauty-spa/40 hover:border-beauty-spa dark:hover:border-beauty-spa transition-all duration-300"
            >
              <Image
                fill
                alt={`Influencer content ${idx + 1}`}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                src={image}
              />

              {data.captions && data.captions[idx] && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-sm">{t(data.captions[idx], locale)}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {data.cta && (
          <div className="text-center mt-10">
            <Button asChild className="px-8" size="lg">
              <a href={data.cta.href}>{t(data.cta.label, locale)}</a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}