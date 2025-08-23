import "@/styles/globals.css";
import type { Viewport, Metadata } from "next";

import { Locale } from "@/i18n.config";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { basePageMetadata } from "@/lib/seo";
import { site as siteConfig } from "@/config/site";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

type LayoutParams = { lang: Locale };
type LayoutProps = { children: React.ReactNode; params: Promise<LayoutParams> };

export async function generateMetadata({
  params,
}: {
  params: Promise<LayoutParams>;
}): Promise<Metadata> {
  const { lang } = await params;
  const url = `${siteConfig.url}/${lang}/admin`;

  return basePageMetadata({
    title: "Admin",
    description: "Administrative dashboard.",
    url,
    index: false,
    siteName: siteConfig.name,
  });
}

export default async function AdminLayout({ children /*, params*/ }: LayoutProps) {
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
