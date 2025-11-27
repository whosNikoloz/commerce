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

  const dict = await getDictionary(lang);

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
  const dict = await getDictionary(lang);

  const [categories, brands] = await Promise.all([
    getAllCategories(),
    getAllBrands(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {dict.pages.admin.productGroups.heading}
          </h1>
          <p className="text-muted-foreground mt-2">
            {dict.pages.admin.productGroups.subtitle}
          </p>
        </div>
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
    <Card className="bg-white/70 dark:bg-slate-900/70 border-white/20 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
