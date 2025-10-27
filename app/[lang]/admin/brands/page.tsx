import type { Metadata } from "next";
import type { BrandModel } from "@/types/brand";
import type { Locale } from "@/i18n.config";

import { cache } from "react";

import { BrandsTable } from "@/components/admin/brand/brands-table";
import { i18nPageMetadataAsync } from "@/lib/seo"; // ← use async helper
import { getAllBrands } from "@/app/api/services/brandService";

const getBrandsCached = cache(async (): Promise<BrandModel[]> => {
  return await getAllBrands();
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadataAsync({
    title: "Admin • Brands",
    description: "Manage all brands in the admin dashboard.",
    lang,
    path: "/admin/brands",
    index: false, // noindex for admin
    // no images/siteName needed — resolved per host
  });
}

export default async function BrandsPage() {
  const brands = await getAllBrands();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-purple-900 to-violet-900 dark:from-slate-100 dark:via-purple-100 dark:to-violet-100 bg-clip-text text-transparent">
          Brands
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
          Manage your brand catalog and origins
        </p>
      </div>

      <BrandsTable Brands={brands} />
    </div>
  );
}
