"use client";

import { Users, Globe, Package, Star } from "lucide-react";
import { useState, useEffect } from "react";

const stats = [
  { icon: Users, label: "Happy Customers", value: 50000, suffix: "+" },
  { icon: Package, label: "Products Sold", value: 250000, suffix: "+" },
  { icon: Star, label: "5-Star Reviews", value: 98, suffix: "%" },
  { icon: Globe, label: "Countries Served", value: 45, suffix: "" },
];

export function StatsShowcase() {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsVisible(true), {
      threshold: 0.3,
    });
    const el = document.getElementById("stats-section");

    if (el) obs.observe(el);

    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    stats.forEach((stat, index) => {
      const duration = 2000;
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timer);
        }
        setAnimatedValues((prev) => {
          const next = [...prev];

          next[index] = Math.floor(current);

          return next;
        });
      }, duration / steps);
    });
  }, [isVisible]);

  return (
    <section className="py-20 bg-brand-surface dark:bg-brand-surfacedark" id="stats-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-brand-primary to-brand-primarydark bg-clip-text text-transparent">
            Numbers That Speak
          </h2>
          <p className="text-lg text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
            Our commitment to excellence is reflected in every metric
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-brand-primary/10 dark:bg-brand-primary/20 group-hover:bg-brand-primary/20 dark:group-hover:bg-brand-primary/30 transition-colors">
                  <Icon className="w-10 h-10 text-brand-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-lightdark mb-2">
                  {animatedValues[index].toLocaleString()}
                  {stat.suffix}
                </div>
                <p className="text-text-subtle dark:text-text-subtledark font-medium">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
