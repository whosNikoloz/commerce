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
  const brands = await getBrandsCached();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light">
          Brands
        </h1>
      </div>

      <BrandsTable Brands={brands} />
    </div>
  );
}
