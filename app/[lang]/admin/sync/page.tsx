import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import { i18nPageMetadataAsync } from "@/lib/seo"; // ← async SEO helper
import FinaSyncPanel from "@/components/admin/fina-sync-panel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadataAsync({
    title: "Admin • Synchronization",
    description: "Run synchronizations and view live logs.",
    lang,
    path: "/admin/sync",
    index: false, // admin pages should not be indexed
  });
}

export default async function AdminSyncPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light">
          Synchronization
        </h1>
        <p className="text-sm text-muted-foreground">
          Trigger sync jobs, monitor status, and view a live activity log.
        </p>
      </div>
      <FinaSyncPanel />
    </div>
  );
}
