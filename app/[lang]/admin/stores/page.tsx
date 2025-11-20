import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import { Suspense } from "react";

import { StoresTable } from "@/components/admin/store/stores-table";
import { i18nPageMetadataAsync } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return i18nPageMetadataAsync({
    title: "Admin • Stores",
    description: "Manage all stores and transfer products between locations.",
    lang,
    path: "/admin/stores",
    index: false, // exclude admin from search engines
  });
}

export default async function StoresPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 dark:from-slate-100 dark:via-blue-100 dark:to-cyan-100 bg-clip-text text-transparent">
          Stores
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
          Manage store locations and transfer products between them
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border p-6 bg-brand-muted dark:bg-brand-muteddark">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-40 bg-gray-300/40 dark:bg-gray-600/40 rounded" />
              <div className="h-10 w-full bg-gray-300/30 dark:bg-gray-700/30 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-300/20 dark:bg-gray-700/20 rounded" />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <StoresTable />
      </Suspense>
    </div>
  );
}
