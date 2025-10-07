'use client'
import type { HeroLifestyleData, Locale } from "@/types/tenant";


import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";


interface HeroLifestyleProps {
  data: HeroLifestyleData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default function HeroLifestyle({ data, locale, template = 2 }: HeroLifestyleProps) {

   const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleMouseMove = (e: { currentTarget: { getBoundingClientRect: () => any; }; clientX: number; clientY: number; }) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-blue-900 min-h-screen">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative container mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Content */}
          <div className={`space-y-8 lg:pr-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="space-y-6">
              {/* Animated Badge */}
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-px bg-gradient-to-r from-blue-400 to-orange-400 group-hover:w-20 transition-all duration-500"></div>
                <span className="text-xs tracking-[0.25em] uppercase text-blue-400 font-bold animate-pulse">
                  Home & Furniture
                </span>
              </div>
              
              {/* Headline with gradient */}
              <h1 className="text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-orange-200 leading-[1.1] animate-in">
                {t(data.headline, locale)}
              </h1>

              {/* Animated underline */}
              <div className="h-1 w-32 bg-gradient-to-r from-blue-500 via-orange-500 to-blue-500 rounded-full animate-pulse" />

              <p className="text-lg text-neutral-300 leading-relaxed max-w-xl">
                {t(data.subheadline,locale)}
              </p>
            </div>

            {/* Animated Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button className="group relative bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105">
                <span className="relative z-10 font-semibold">Shop Collection</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
              <Button className="group border-2 border-blue-400 text-blue-400 px-8 py-4 hover:bg-blue-400 hover:text-neutral-900 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-400/50">
                <span className="font-semibold">Browse Catalog</span>
              </Button>
            </div>

            {/* Animated Features */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-neutral-700">
              {[
                { value: 'Free', label: 'Shipping', delay: '0ms' },
                { value: '30-Day', label: 'Returns', delay: '150ms' },
                { value: '5-Year', label: 'Warranty', delay: '300ms' }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="group cursor-pointer"
                  style={{ animationDelay: item.delay }}
                >
                  <div className="text-2xl font-bold text-blue-400 mb-1 group-hover:scale-110 transition-transform">{item.value}</div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wide group-hover:text-blue-400 transition-colors">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image with 3D Effect */}
          <div 
            className={`relative group transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
            onMouseMove={handleMouseMove}
          >
            {/* 3D Rotating Frame */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 to-orange-500/30 blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse" />
            
            <div className="relative overflow-hidden rounded-2xl shadow-2xl transform group-hover:scale-105 transition-all duration-700">
              <div
                className="aspect-[3/4] bg-cover bg-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                style={{ 
                  backgroundImage: `url(${data.imageUrl})`,
                  transform: `perspective(1000px) rotateY(${(mousePosition.x - 300) / 50}deg) rotateX(${(mousePosition.y - 400) / -50}deg)`
                }}
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent"
                style={{ opacity: data.overlayOpacity }}
              />
              
              {/* Animated Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
              </div>
            </div>
            
            {/* Floating Animated Badge */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-br from-blue-500 to-orange-600 text-white px-6 py-4 shadow-2xl shadow-amber-500/50 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="text-xs tracking-widest uppercase font-bold">New Arrival</div>
              <div className="text-2xl font-bold mt-1">2025</div>
            </div>

            {/* Floating Particles */}
            <div className="absolute top-1/4 -left-4 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75" />
            <div className="absolute bottom-1/3 -right-4 w-3 h-3 bg-orange-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }} />
            <div className="absolute top-2/3 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      </div>

      {/* Animated Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-orange-500 to-blue-500 animate-pulse" />
    </section>
  );
}