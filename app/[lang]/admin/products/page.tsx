// app/admin/products/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { cache } from "react";

import { ProductsTable } from "@/components/admin/product/products-table";
import { basePageMetadata } from "@/lib/seo";
import { site as siteConfig } from "@/config/site";
import { getAllCategories } from "@/app/api/services/categoryService";
import type { CategoryModel } from "@/types/category";

const getCategoriesCached = cache(async (): Promise<CategoryModel[]> => {
  return await getAllCategories();
});

export const metadata: Metadata = basePageMetadata({
  title: "Admin • Products",
  description: "Manage all products in the admin dashboard.",
  url: `${siteConfig.url}/admin/products`,
  index: false,
  siteName: siteConfig.name,
});

export default async function ProductsPage() {
  const categories = await getCategoriesCached();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light">
          Products
        </h1>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border p-6 bg-brand-muted dark:bg-brand-muteddark">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-40 bg-gray-300/40 dark:bg-gray-600/40 rounded" />
              <div className="h-10 w-full bg-gray-300/30 dark:bg-gray-700/30 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-300/30 dark:bg-gray-700/30 rounded" />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <ProductsTable initialCategories={categories} />
      </Suspense>
    </div>
  );
}
