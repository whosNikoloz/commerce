import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";
import type { CategoryModel } from "@/types/category";

import { Suspense, cache } from "react";

import { i18nPageMetadataAsync } from "@/lib/seo";
import { getAllCategories } from "@/app/api/services/categoryService";
import { FacetsTable } from "@/components/admin/facet/facet-table";
import { getDictionary } from "@/lib/dictionaries";

const getCategoriesCached = cache(async (): Promise<CategoryModel[]> => {
  return await getAllCategories();
});

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';

  const dict = await getDictionary(lang);

  return i18nPageMetadataAsync({
    title: dict.pages.admin.facets.title,
    description: dict.pages.admin.facets.description,
    lang,
    path: "/admin/facets",
    index: false,
  });
}

export default async function FacetsPage(
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';
  const dict = await getDictionary(lang);
  const categories = await getCategoriesCached();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
          {dict.pages.admin.facets.heading}
        </h1>
        <p className="font-primary text-slate-600 dark:text-slate-400 text-lg font-medium">
          {dict.pages.admin.facets.subtitle}
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border p-6 bg-brand-muted dark:bg-brand-muteddark">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-40 bg-gray-300/40 dark:bg-gray-600/40 rounded" />
              <div className="h-10 w-full bg-gray-300/30 dark:bg-gray-700/30 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-gray-300/30 dark:bg-gray-700/30 rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <FacetsTable initialCategories={categories} />
      </Suspense>
    </div>
  );
}
