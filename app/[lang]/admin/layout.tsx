import type { Viewport, Metadata } from "next";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { i18nPageMetadataAsync } from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = raw === "ka" || raw === "en" ? raw : "en";

  return i18nPageMetadataAsync({
    title: "Admin",
    description: "Administrative dashboard.",
    lang,
    path: "/admin",
    index: false,
  });
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  return (
    <AdminSidebar>
      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex h-full w-full flex-1 flex-col gap-6  p-4 md:p-8 lg:p-10
                        bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30
                        dark:from-slate-950 dark:via-slate-900 dark:to-slate-900
                        border-l border-t
                        border-slate-200/60 dark:border-slate-800/60
                        shadow-xl
                        overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] dark:opacity-[0.03] pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
