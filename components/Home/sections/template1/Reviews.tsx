import type { ReviewsData, Locale } from "@/types/tenant";

import { Star, Quote } from "lucide-react";

import { t, tOpt } from "@/lib/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ReviewsProps {
  data: ReviewsData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default function Reviews({ data, locale, template = 1 }: ReviewsProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t(data.title, locale)}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what our customers are saying about their experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {data.reviews.map((review, idx) => (
            <Card
              key={idx}
              className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-brand-primary/50 bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className={`h-4 w-4 transition-colors ${
                          starIdx < review.rating
                            ? "fill-blue-400 text-blue-400"
                            : "fill-muted text-muted stroke-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-brand-primary/10 group-hover:text-brand-primary/20 transition-colors" />
                </div>

                <p className="text-sm leading-relaxed text-foreground/90 line-clamp-4">
                  {t(review.text, locale)}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Avatar className="h-10 w-10 border-2 border-brand-primary/10">
                    <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-semibold text-sm">
                      {review.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {review.author}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString(locale === 'ka' ? 'ka-GE' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {review.productName && (
                  <Badge variant="secondary" className="mt-3 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border-0">
                    {tOpt(review.productName, locale)}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}