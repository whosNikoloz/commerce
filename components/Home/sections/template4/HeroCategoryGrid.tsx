'use client'
import type { HeroCategoryGridData, Locale } from "@/types/tenant";
import type { CategoryModel } from "@/types/category";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles, ChevronRight, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { getAllCategories } from "@/app/api/services/categoryService";

interface HeroCategoryGridProps {
  data: HeroCategoryGridData;
  locale: Locale;
}

export default function HeroCategoryGrid({ data, locale }: HeroCategoryGridProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllCategories();
        setCategories(data ?? []);
      } catch (e) {
        console.error(e);
        setError(locale === "ka" ? "კატეგორიების ჩატვირთვა ვერ მოხერხდა" : "Failed to load categories");
      } finally {
        setLoading(false);
      }
    })();
  }, [locale]);

  const parents = useMemo(
    () => categories.filter((c) => !c.parentId || c.parentId.trim() === ""),
    [categories],
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<string, CategoryModel[]>();
    for (const c of categories) {
      const pid = c.parentId?.trim();
      if (!pid) continue;
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid)!.push(c);
    }
    return map;
  }, [categories]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero + Categories Side-by-Side Layout */}
      <div className="relative min-h-screen">
        {/* Background Image */}
        {data.backgroundImage && (
          <div className="absolute inset-0 z-0">
            <Image
              alt="Hero background"
              className="object-cover opacity-[0.12] dark:opacity-[0.06]"
              fill
              priority
              sizes="100vw"
              src={data.backgroundImage}
            />
          </div>
        )}

        {/* Modern Gradient Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/[0.08] via-transparent to-transparent dark:from-brand-primary/[0.15] z-[1]" />

        <div className="relative z-10 container mx-auto px-4 lg:px-6 xl:px-8 py-8 lg:py-12">
          <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-8 items-start min-h-[calc(100vh-4rem)]">

            {/* Left: Hero Content */}
            <div className="flex flex-col justify-center py-12 lg:py-20">

              {/* Badge */}
              {data.badge && (
                <div className={`mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-brand-primary/15 via-brand-primary/10 to-transparent dark:from-brand-primary/25 dark:via-brand-primary/15 border border-brand-primary/30 dark:border-brand-primary/40 backdrop-blur-sm shadow-lg">
                    <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
                    <span className="text-base font-bold bg-gradient-to-r from-brand-primary to-brand-primarydark bg-clip-text text-transparent">
                      {t(data.badge, locale)}
                    </span>
                  </div>
                </div>
              )}

              {/* Hero Headline */}
              <div className={`space-y-8 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}`}>
                <div className="space-y-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent leading-[1.05] tracking-tight">
                    {t(data.headline, locale)}
                  </h1>

                  {data.subheadline && (
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-700 dark:text-slate-300 leading-tight">
                      {t(data.subheadline, locale)}
                    </p>
                  )}

                  {data.description && (
                    <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                      {t(data.description, locale)}
                    </p>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 pt-4">
                  {data.primaryCta && (
                    <Button
                      asChild
                      className="h-14 px-10 text-base font-bold shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(var(--brand-primary),0.5)] transition-all hover:scale-105 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-primarydark"
                      size="lg"
                    >
                      <Link href={data.primaryCta.href}>
                        {t(data.primaryCta.label, locale)}
                        <ArrowRight className="w-5 h-5 ml-3" />

                      </Link>
                    </Button>
                  )}
                </div>

                {/* Stats */}
                {data.stats && data.stats.length > 0 && (
                  <div className={`grid grid-cols-3 gap-6 pt-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {data.stats.map((stat, index) => (
                      <div key={index} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent rounded-2xl group-hover:from-brand-primary/10 transition-colors" />
                        <div className="relative p-4">
                          <div className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-br from-brand-primary to-brand-primarydark bg-clip-text text-transparent mb-1">
                            {stat.value}
                          </div>
                          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            {t(stat.label, locale)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Features */}
                {data.features && data.features.length > 0 && (
                  <div className={`space-y-3 pt-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {data.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 group">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-brand-primary to-brand-primarydark flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <span className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-semibold">
                          {t(feature, locale)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Categories Sidebar with Subcategories */}
            <div className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] mt-10">
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.8)] border-2 border-slate-200/50 dark:border-slate-700/50 overflow-hidden">

                {/* Header */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-primarydark to-brand-primary opacity-95" />
                  <div className="relative px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-xl text-white">
                          {locale === "ka" ? "კატეგორიები" : "Categories"}
                        </h2>
                        <p className="text-xs text-white/80 mt-0.5">
                          {locale === "ka" ? "აირჩიეთ კატეგორია" : "Browse all categories"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-32 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-red-500 text-sm font-medium">{error}</div>
                ) : (
                  <div className="overflow-y-auto scrollbar-custom  max-h-[calc(100vh-12rem)]">
                    <div className="p-4 space-y-3">
                      {parents.slice(0, 8).map((category, index) => {
                        const children = childrenByParent.get(category.id) ?? [];

                        return (
                          <div
                            key={category.id}
                            className={`bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-brand-primary dark:hover:border-brand-primary transition-all duration-300 hover:shadow-lg ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                            style={{ transitionDelay: `${index * 80}ms` }}
                          >
                            {/* Category Header */}
                            <Link
                              href={`/category/${category.id}`}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-transparent to-brand-primary/5 dark:to-brand-primary/10 hover:to-brand-primary/10 dark:hover:to-brand-primary/20 transition-all group"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primarydark rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                  <Package className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors truncate">
                                    {category.name}
                                  </h3>
                                  {children.length > 0 && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                      {children.length} {locale === "ka" ? "ქვეკატეგორია" : "subcategories"}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </Link>

                            {/* Subcategories - Always Visible */}
                            {children.length > 0 && (
                              <div className="px-4 pb-4 pt-2">
                                <div className="space-y-1.5">
                                  {children.slice(0, 6).map((child) => (
                                    <Link
                                      key={child.id}
                                      href={`/category/${child.id}`}
                                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 rounded-lg transition-all duration-200 hover:translate-x-1 group/sub"
                                    >
                                      <div className="w-1 h-1 rounded-full bg-slate-400 group-hover/sub:bg-brand-primary transition-colors flex-shrink-0" />
                                      <span className="truncate">{child.name}</span>
                                    </Link>
                                  ))}
                                  {children.length > 6 && (
                                    <Link
                                      href={`/category/${category.id}`}
                                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all mt-2"
                                    >
                                      {locale === "ka" ? `+${children.length - 6} მეტი` : `+${children.length - 6} more`}
                                      <ChevronRight className="w-3 h-3" />
                                    </Link>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {parents.length > 8 && (
                      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50">
                        <Link
                          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-primarydark text-white hover:shadow-lg transition-all duration-300 font-semibold rounded-xl hover:scale-[1.02] text-sm"
                          href="/category"
                        >
                          {locale === "ka" ? "ყველა კატეგორია" : "View All Categories"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        /* Custom scrollbar */
        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgb(203 213 225 / 0.5);
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgb(148 163 184 / 0.7);
        }
        .dark .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgb(71 85 105 / 0.5);
        }
        .dark .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgb(100 116 139 / 0.7);
        }
      `}</style>
    </section>
  );
}
