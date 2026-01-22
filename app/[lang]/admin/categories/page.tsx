// app/[lang]/admin/categories/page.tsx
import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import { CategoriesTreeView } from "@/components/admin/category/categories-tree-view";
import { getAllCategories } from "@/app/api/services/categoryService";
import { i18nPageMetadataAsync } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionaries";

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';

  const dict = await getDictionary(lang, null, 'admin');

  return i18nPageMetadataAsync({
    title: dict.pages.admin.categories.title,
    description: dict.pages.admin.categories.description,
    lang,
    path: "/admin/categories",
    index: false,
  });
}

export default async function CategoriesPage(
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';
  const dict = await getDictionary(lang, null, 'admin');
  const categories = await getAllCategories();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl md:text-5xl h-14 font-black tracking-tight bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 dark:from-slate-100 dark:via-emerald-100 dark:to-teal-100 bg-clip-text text-transparent">
          {dict.pages.admin.categories.title}
        </h1>
        <p className="font-primary text-slate-600 dark:text-slate-400 text-lg font-medium">
          {dict.pages.admin.categories.description}
        </p>
      </div>

      <CategoriesTreeView initialCategories={categories} />
    </div>
  );
}
