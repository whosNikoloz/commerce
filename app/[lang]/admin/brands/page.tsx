import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import { BrandsTable } from "@/components/admin/brand/brands-table";
import { i18nPageMetadataAsync } from "@/lib/seo";
import { getAllBrands } from "@/app/api/services/brandService";
import { getDictionary } from "@/lib/dictionaries";

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';

  const dict = await getDictionary(lang, null, 'admin');

  return i18nPageMetadataAsync({
    title: dict.pages.admin.brands.title,          // Admin • Brands
    description: dict.pages.admin.brands.description,
    lang,
    path: "/admin/brands",
    index: false,
  });
}

export default async function BrandsPage(
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ka';
  const dict = await getDictionary(lang, null, 'admin');
  const brands = await getAllBrands();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl md:text-5xl h-14 font-black tracking-tight bg-gradient-to-r from-slate-900 via-purple-900 to-violet-900 dark:from-slate-100 dark:via-purple-100 dark:to-violet-100 bg-clip-text text-transparent">
          {dict.pages.admin.brands.title}
        </h1>
        <p className="font-primary text-slate-600 dark:text-slate-400 text-lg font-medium">
          {dict.pages.admin.brands.description}
        </p>
      </div>

      <BrandsTable Brands={brands} />
    </div>
  );
}
