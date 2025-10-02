"use client";

import type { NewsletterData, Locale } from "@/types/tenant";

import { useState } from "react";
import { Mail } from "lucide-react";

import { t, tOpt } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterProps {
  data: NewsletterData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default function Newsletter({ data, locale, template = 2 }: NewsletterProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribe:", email);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-home-warm to-home-modern dark:from-home-elegant dark:to-home-modern">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center text-white">
          <div className="inline-block bg-white/20 p-4 rounded-full mb-6 animate-home-sway">
            <Mail className="h-10 w-10" />
          </div>

          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {t(data.title, locale)}
          </h2>

          <p className="text-lg text-home-comfort/90 dark:text-home-comfort mb-8">
            {t(data.description, locale)}
          </p>

          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={handleSubmit}
          >
            <Input
              required
              className="flex-1 bg-white dark:bg-background"
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
            <p className="text-sm text-home-comfort/80 mt-4">
              {tOpt(data.privacyNote, locale)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}