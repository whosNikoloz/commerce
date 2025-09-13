"use client";

import type React from "react";

import { useState } from "react";
import { Mail, Gift, Truck, Shield } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail("");
    }, 3000);
  };

  const perks = [
    {
      Icon: Gift,
      title: "Exclusive Deals",
      text: "Get access to subscriber-only discounts and flash sales",
    },
    {
      Icon: Truck,
      title: "Early Access",
      text: "Be the first to shop new arrivals and limited editions",
    },
    {
      Icon: Shield,
      title: "VIP Treatment",
      text: "Enjoy priority customer support and special perks",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Header */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-brand-primary to-brand-primarydark bg-clip-text text-transparent">
              Stay in the Loop
            </h2>
            <p className="text-base sm:text-lg text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
              Get exclusive deals, early access to new products, and insider shopping tips delivered
              to your inbox
            </p>
          </div>

          {/* Form */}
          <form
            aria-labelledby="newsletter-heading"
            className="mx-auto mb-10 sm:mb-12 w-full max-w-xl"
            onSubmit={handleSubmit}
          >
            <label className="sr-only" htmlFor="email">
              Email address
            </label>

            {/* Stack on mobile, row on ≥sm */}
            <div className="flex flex-col justify-around sm:flex-row gap-2 sm:gap-3 p-2 sm:p-2.5 bg-brand-surface dark:bg-brand-surfacedark rounded-2xl sm:rounded-full border border-brand-muted dark:border-brand-muteddark shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4">
                <Mail
                  aria-hidden
                  className="w-5 h-5 text-text-subtle dark:text-text-subtledark hidden xs:block"
                />
                <input
                  required
                  autoComplete="email"
                  className="w-full bg-transparent border-0 outline-none text-text-light dark:text-text-lightdark placeholder:text-text-subtle dark:placeholder:text-text-subtledark px-0 py-2 sm:py-3"
                  id="email"
                  inputMode="email"
                  placeholder="Enter your email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-brand-primary text-white rounded-xl sm:rounded-full font-medium transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary/50 dark:focus-visible:ring-offset-0"
                disabled={isSubscribed}
                type="submit"
              >
                {isSubscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </div>

            {/* Live region for status updates */}
            <div aria-live="polite" className="sr-only" role="status">
              {isSubscribed ? "Subscription successful." : ""}
            </div>
          </form>

          {/* Perks grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {perks.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl bg-brand-surface/40 dark:bg-brand-surfacedark/40"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 bg-brand-primary/10 dark:bg-brand-primary/20">
                  <Icon aria-hidden className="w-7 h-7 sm:w-8 sm:h-8 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-text-light dark:text-text-lightdark mb-1.5 sm:mb-2 text-base sm:text-lg">
                  {title}
                </h3>
                <p className="text-text-subtle dark:text-text-subtledark text-sm sm:text-base leading-relaxed max-w-xs">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
