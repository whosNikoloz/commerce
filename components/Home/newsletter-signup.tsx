"use client";

import type React from "react";

import { useState } from "react";
import { Mail, Gift, Truck, Shield } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-brand-primary to-brand-primarydark bg-clip-text text-transparent">
              Stay in the Loop
            </h2>
            <p className="text-lg text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
              Get exclusive deals, early access to new products, and insider shopping tips delivered
              to your inbox
            </p>
          </div>

          <form className="max-w-md mx-auto mb-12" onSubmit={handleSubmit}>
            <div className="flex gap-2 p-2 bg-brand-surface dark:bg-brand-surfacedark rounded-full border border-brand-muted dark:border-brand-muteddark shadow-lg">
              <Mail className="w-5 h-5 text-text-subtle dark:text-text-subtledark ml-4 mt-3" />
              <input
                required
                className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-text-light dark:text-text-lightdark placeholder:text-text-subtle dark:placeholder:text-text-subtledark"
                placeholder="Enter your email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="px-6 py-3 bg-brand-primary text-white rounded-full font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                disabled={isSubscribed}
                type="submit"
              >
                {isSubscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
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
            ].map(({ Icon, title, text }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-brand-primary/10 dark:bg-brand-primary/20">
                  <Icon className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-text-light dark:text-text-lightdark mb-2">
                  {title}
                </h3>
                <p className="text-text-subtle dark:text-text-subtledark text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
