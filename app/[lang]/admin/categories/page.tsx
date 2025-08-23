import { Metadata } from "next";

import { CategoriesTable } from "@/components/admin/categories-table";
import { getAllCategories } from "@/app/api/services/categoryService";
import { basePageMetadata } from "@/lib/seo";
import { site as siteConfig } from "@/config/site";
import { CategoryModel } from "@/types/category";

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

export default async function CategoriesPage() {
  const categories: CategoryModel[] = await getAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light ">
          Categories
        </h1>
      </div>
      <CategoriesTable Categories={categories} />
    </div>
  );
}
