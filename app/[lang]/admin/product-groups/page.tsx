import { Suspense } from "react";

import { getAllCategories } from "@/app/api/services/categoryService";
import { getAllBrands } from "@/app/api/services/brandService";
import { ProductGroupsTable } from "@/components/admin/product-group/product-groups-table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ProductGroupsPage() {
  const [categories, brands] = await Promise.all([
    getAllCategories(),
    getAllBrands(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Product Groups
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage product groups filtered by category and brand
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
