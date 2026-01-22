import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import { Suspense } from "react";

import { getAllCategories } from "@/app/api/services/categoryService";
import { getAllBrands } from "@/app/api/services/brandService";
import { ProductGroupsTable } from "@/components/admin/product-group/product-groups-table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDictionary } from "@/lib/dictionaries";
import { i18nPageMetadataAsync } from "@/lib/seo";

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';

  const dict = await getDictionary(lang, null, 'admin');

  return i18nPageMetadataAsync({
    title: dict.pages.admin.productGroups.title,
    description: dict.pages.admin.productGroups.description,
    lang,
    path: "/admin/product-groups",
    index: false,
  });
}

export default async function ProductGroupsPage(
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';
  const dict = await getDictionary(lang, null, 'admin');

  const [categories, brands] = await Promise.all([
    getAllCategories(),
    getAllBrands(),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl md:text-5xl h-14 font-black tracking-tight bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 dark:from-slate-100 dark:via-emerald-100 dark:to-teal-100 bg-clip-text text-transparent">
          {dict.pages.admin.productGroups.title}
        </h1>
        <p className="font-primary text-slate-600 dark:text-slate-400 text-lg font-medium">
          {dict.pages.admin.productGroups.description}
        </p>
      </div>

      <Suspense fallback={<ProductGroupsTableSkeleton />}>
        <ProductGroupsTable
          initialBrands={brands}
          initialCategories={categories}
        />
      </Suspense>
    </div>
  );
}

function ProductGroupsTableSkeleton() {
  return (
    <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none rounded-lg" />
      <CardContent className="p-6 relative">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
