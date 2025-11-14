import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";


import { i18nPageMetadataAsync } from "@/lib/seo"; // ← use async helper
import { AnalyticsDashboard } from "@/components/admin/analytic/analytics-dashboard";

// const _getBrandsCached = cache(async (): Promise<BrandModel[]> => {
//   return await getAllBrands();
// });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadataAsync({
    title: "Admin • Analytics",
    description: "Admin analytics dashboard",
    lang,
    path: "/admin/analytics",
    index: false, // noindex for admin
    // no images/siteName needed — resolved per host
  });
}

export default async function AnalyticsPage() {
  //const brands = await getAllBrands();

  return (
    <main className="min-h-screen">
      <AnalyticsDashboard />
    </main>
  );
}
