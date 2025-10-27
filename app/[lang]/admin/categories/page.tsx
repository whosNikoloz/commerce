// app/[lang]/admin/categories/page.tsx
import type { Metadata } from "next";
import type { CategoryModel } from "@/types/category";
import type { Locale } from "@/i18n.config";

import { cache } from "react";

import { CategoriesTable } from "@/components/admin/categories-table";
import { getAllCategories } from "@/app/api/services/categoryService";
import { i18nPageMetadataAsync } from "@/lib/seo"; // ← async SEO helper

const getCategoriesCached = cache(async (): Promise<CategoryModel[]> => {
  return await getAllCategories();
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadataAsync({
    title: "Admin • Categories",
    description: "Manage all categories in the admin dashboard.",
    lang,
    path: "/admin/categories",
    index: false, // keep admin pages out of search
  });
}

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl h-14 font-black tracking-tight bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 dark:from-slate-100 dark:via-emerald-100 dark:to-teal-100 bg-clip-text text-transparent">
          Categories
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
          Organize your product hierarchy and facets
        </p>
      </div>
      <CategoriesTable initialCategories={categories} />
    </div>
  );
}
