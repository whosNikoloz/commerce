import { CategoriesTable } from "@/components/admin/categories-table"
import { basePageMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { site as siteConfig } from "@/config/site";


export async function generateMetadata(): Promise<Metadata> {
  const url = `${siteConfig.url}/admin/categories`;
  return basePageMetadata({
    title: "Admin • Categories",
    description: "Manage all categories in the admin dashboard.",
    url,
    index: false,
    siteName: siteConfig.name,
  });
}

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light ">Categories</h1>
      </div>
      <CategoriesTable />
    </div>
  )
}
