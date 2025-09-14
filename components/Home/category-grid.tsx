"use client";

import type { CategoryModel } from "@/types/category";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { getAllCategories } from "@/app/api/services/categoryService";

const gradientPool = [
  "from-brand-primary/20 to-brand-muted/20",
  "from-brand-muted/20 to-brand-primary/20",
  "from-brand-primarydark/20 to-brand-muted/20",
  "from-brand-muted/20 to-brand-primarydark/20",
  "from-brand-primary/15 to-brand-primarydark/15",
  "from-brand-muted/15 to-brand-primary/15",
];

export function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllCategories();

        setCategories(data ?? []);
      } catch (e) {
        console.error(e);
        setError("კატეგორიების ჩატვირთვა ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  if (loading) {
    return (
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-brand-surface dark:bg-brand-surfacedark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-text-light dark:text-text-lightdark mb-3 sm:mb-6">
              Shop by <span className="block text-brand-primary">Category</span>
            </h2>
            <p className="text-sm sm:text-xl text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
              იტვირთება…
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark overflow-hidden"
              >
                <div className="aspect-square md:h-64 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 px-6 bg-brand-surface dark:bg-brand-surfacedark">
        <div className="max-w-7xl mx-auto text-center text-red-500">{error}</div>
      </section>
    );
  }

  if (!parents.length) {
    return (
      <section className="py-24 px-6 bg-brand-surface dark:bg-brand-surfacedark">
        <div className="max-w-7xl mx-auto text-center text-text-subtle dark:text-text-subtledark">
          მშობელი კატეგორია არ არსებობს.
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-brand-surface dark:bg-brand-surfacedark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-text-light dark:text-text-lightdark mb-3 sm:mb-6">
            Shop by <span className="block text-brand-primary">Category</span>
          </h2>
          <p className="text-sm sm:text-xl text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
            Discover our carefully curated collections designed for every lifestyle
          </p>
        </div>

        {/* Square on mobile, fixed height on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
          {parents.map((parent, index) => {
            const children = childrenByParent.get(parent.id) ?? [];
            const subcats = children.slice(0, 4).map((c) => c.name ?? "—");
            const countLabel =
              children.length > 0
                ? `${children.length} ქვეკატეგორია`
                : (parent.description?.trim()?.length ?? 0) > 0
                  ? parent.description
                  : " ";

            const parentHref = `/category/${parent.id}`;
            const gradient = gradientPool[index % gradientPool.length];

            return (
              <div
                key={parent.id}
                className="group"
                onMouseEnter={() => setHovered(parent.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <Link
                  className="block relative overflow-hidden rounded-3xl bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted/50 dark:border-brand-muteddark/50 hover:border-brand-primary/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-brand-primary/10"
                  href={parentHref}
                >
                  {/* Image block: square on mobile, h-64 on md+ */}
                  <div className="relative aspect-square md:h-64 overflow-hidden">
                    <Image
                      fill
                      alt={parent.name || "კატეგორია"}
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                      src={"/placeholder.png"}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${gradient} group-hover:opacity-80 transition-opacity duration-300`}
                    />

                    {/* Header strip */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-black/75 sm:bg-black/80 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h3 className="text-lg sm:text-2xl font-bold text-white">
                          {parent.name || "უსახელო"}
                        </h3>
                        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:translate-x-2" />
                      </div>
                      <p className="text-white/90 text-xs sm:text-sm line-clamp-1">{countLabel}</p>
                    </div>
                  </div>

                  {/* Subcategories */}
                  <div className="p-4 sm:p-6">
                    {subcats.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {subcats.map((sub, subIndex) => (
                          <Link
                            key={`${parent.id}-${sub}-${subIndex}`}
                            className="text-[12px] sm:text-sm text-text-subtle dark:text-text-subtledark hover:text-brand-primary transition-colors cursor-pointer py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg hover:bg-brand-primary/5 border border-transparent hover:border-brand-primary/20"
                            href={`/category/${children[subIndex]?.id ?? parent.id}`}
                            style={{
                              animationDelay: `${index * 0.1 + subIndex * 0.05}s`,
                              opacity: hovered === parent.id ? 1 : 0.9,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-subtle dark:text-text-subtledark italic" />
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <Link
            className="group inline-flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
            href="/category"
          >
            View All Categories
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
