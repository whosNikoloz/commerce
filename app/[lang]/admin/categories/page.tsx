// app/[lang]/admin/categories/page.tsx
import type { Metadata } from "next";
import type { CategoryModel } from "@/types/category";
import type { Locale } from "@/i18n.config";

import { cache } from "react";

import { CategoriesTable } from "@/components/admin/categories-table";
import { getAllCategories } from "@/app/api/services/categoryService";
import { i18nPageMetadata } from "@/lib/seo";
import { site as siteConfig } from "@/config/site";

const getCategoriesCached = cache(async (): Promise<CategoryModel[]> => {
  return await getAllCategories();
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadata({
    title: "Admin • Categories",
    description: "Manage all categories in the admin dashboard.",
    lang,
    path: "/admin/categories",
    images: [siteConfig.ogImage],
    siteName: siteConfig.name,
    index: false, // keep admin pages out of search
  });
}

export default async function CategoriesPage() {
  const categories = await getCategoriesCached();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light">
          Categories
        </h1>
      </div>
      <CategoriesTable Categories={categories} />
    </div>
  );
}
