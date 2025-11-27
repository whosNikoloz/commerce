import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import { i18nPageMetadataAsync } from "@/lib/seo";
import { AnalyticsDashboard } from "@/components/admin/analytic/analytics-dashboard";
import { getDictionary } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;

  // Load translations
  const dict = await getDictionary(lang);

  return i18nPageMetadataAsync({
    title: dict.pages.admin.analytics.title,
    description: dict.pages.admin.analytics.description,
    lang,
    path: "/admin/analytics",
    index: false,
  });
}

export default async function AnalyticsPage() {
  return (
    <main className="min-h-screen">
      <AnalyticsDashboard />
    </main>
  );
}
