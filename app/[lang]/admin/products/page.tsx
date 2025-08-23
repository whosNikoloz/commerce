import type { Metadata } from "next";

import { ProductsTable } from "@/components/admin/product/products-table";
import { basePageMetadata } from "@/lib/seo";
import { site as siteConfig } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const url = `${siteConfig.url}/admin/products`;

  return basePageMetadata({
    title: "Admin • Products",
    description: "Manage all products in the admin dashboard.",
    url,
    index: false,
    siteName: siteConfig.name,
  });
}

export default function ProductsPage() {
  return (
    <div className="space-y-6 ">
      {" "}
      <div>
        {" "}
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light ">
          Products
        </h1>
      </div>
      <ProductsTable />
    </div>
  );
}
