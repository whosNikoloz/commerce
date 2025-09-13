import "@/styles/globals.css";
import type { Viewport, Metadata } from "next";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { i18nPageMetadata } from "@/lib/seo";

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

  return i18nPageMetadata({
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
      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border dark:bg-brand-surfacedark bg-brand-surface p-2 md:p-10 dark:border-neutral-700 text-text-light dark:text-text-lightdark">
          {children}
        </div>
      </div>
    </AdminSidebar>
  );
}
