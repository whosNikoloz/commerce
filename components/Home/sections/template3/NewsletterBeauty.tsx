"use client";

import type { NewsletterData, Locale } from "@/types/tenant";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { t, tOpt } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterBeautyProps {
  data: NewsletterData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default function NewsletterBeauty({
  data,
  locale,
  template = 3,
}: NewsletterBeautyProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribe:", email);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-beauty-bloom via-beauty-luxury to-beauty-spa dark:from-beauty-bloom/80 dark:via-beauty-luxury/80 dark:to-beauty-spa/80">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center text-white">
          <div className="inline-block bg-white/20 p-4 rounded-full mb-6 animate-beauty-pulse">
            <Sparkles className="h-10 w-10" />
          </div>

          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {t(data.title, locale)}
          </h2>

          <p className="text-lg text-white/90 dark:text-white/80 mb-8">
            {t(data.description, locale)}
          </p>

          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={handleSubmit}
          >
            <Input
              required
              className="flex-1 bg-white dark:bg-background text-foreground dark:text-foreground"
              placeholder={t(data.emailPlaceholder, locale)}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              className="whitespace-nowrap"
              type="submit"
              variant="secondary"
            >
              {t(data.ctaLabel, locale)}
            </Button>
          </form>

          {data.privacyNote && (
            <p className="text-sm text-white/80 dark:text-white/70 mt-4">
              {tOpt(data.privacyNote, locale)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}