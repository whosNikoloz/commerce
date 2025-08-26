"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAllCategories } from "@/app/api/services/categoryService";
import { CategoryModel } from "@/types/category";

export function CategoryCarousel() {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  const parentCategories = useMemo(
    () => categories.filter((c) => !c.parentId || c.parentId.trim() === ""),
    [categories]
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<string, CategoryModel[]>();
    for (const c of categories) {
      const pid = c.parentId?.trim();
      if (pid) {
        if (!map.has(pid)) map.set(pid, []);
        map.get(pid)!.push(c);
      }
    }
    return map;
  }, [categories]);

  const go = useCallback((href: string) => router.push(href), [router]);

  if (loading)
    return <div className="text-center py-10 text-text-subtle dark:text-text-subtledark">იტვირთება…</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!parentCategories.length)
    return <div className="text-center py-10 text-text-subtle dark:text-text-subtledark">მშობელი კატეგორია არ არსებობს.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parentCategories.map((parent) => {
          const children = childrenByParent.get(parent.id) ?? [];
          const parentHref = `/category/${parent.id}`;

          return (
            <div
              key={parent.id}
              role="link"
              tabIndex={0}
              onClick={() => go(parentHref)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  go(parentHref);
                }
              }}
              className="group cursor-pointer block bg-surface dark:bg-surfacedark rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-muted dark:border-muteddark"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  alt={parent.name || "კატეგორია"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="/img2.jpg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-xl font-bold text-text-light dark:text-text-lightdark group-hover:text-primary dark:group-hover:text-brand-primarydark transition-colors">
                    {parent.name || "უსახელო"}
                  </h3>
                  {children.length > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted dark:bg-muteddark text-text-subtle dark:text-text-subtledark">
                      {children.length} ქვეკატ.
                    </span>
                  )}
                </div>

                <p className="font-sans text-text-subtle dark:text-text-subtledark text-sm mb-4 leading-relaxed">
                  {parent.description || " "}
                </p>

                {children.length > 0 && (
                  <div className="mb-4 -m-1 flex flex-wrap">
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        className="m-1 inline-flex items-center rounded-full border border-muted dark:border-muteddark px-3 py-1 text-xs text-text-subtle dark:text-text-subtledark hover:bg-muted dark:hover:bg-muteddark transition-colors"
                        href={`/category/${child.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {child.name ?? "—"}
                      </Link>
                    ))}
                  </div>
                )}

                <Button asChild className="w-full">
                  <Link href={parentHref} onClick={(e) => e.stopPropagation()}>
                    ყიდვა — {parent.name ?? "კატეგორია"}
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
