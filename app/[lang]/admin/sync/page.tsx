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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl h-14 font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 dark:from-slate-100 dark:via-blue-100 dark:to-cyan-100 bg-clip-text text-transparent">
          Synchronization
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
          Trigger sync jobs, monitor status, and view a live activity log.
        </p>
      </div>
      <FinaSyncPanel />
    </div>
  );
}
