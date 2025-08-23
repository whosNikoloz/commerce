import { Metadata } from "next";

import { BrandsTable } from "@/components/admin/brand/brands-table";
import { basePageMetadata } from "@/lib/seo";
import { site as siteConfig } from "@/config/site";
import { getAllBrands } from "@/app/api/services/brandService";
import { BrandModel } from "@/types/brand";

export async function generateMetadata(): Promise<Metadata> {
  const url = `${siteConfig.url}/admin/brands`;

  return basePageMetadata({
    title: "Admin • Brands",
    description: "Manage all brands in the admin dashboard.",
    url,
    index: false,
    siteName: siteConfig.name,
  });
}

export default async function BrandsPage() {
  const brands: BrandModel[] = await getAllBrands();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light ">
          Brands
        </h1>
      </div>

      <BrandsTable Brands={brands} />
    </div>
  );
}
