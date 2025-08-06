import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "../providers";

import { siteConfig } from "@/config/site";
import { Locale } from "@/i18n.config";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: {
    default: `Admin - ${siteConfig.name}`,
    template: `%s - Admin - ${siteConfig.name}`,
  },
  description: "Admin dashboard",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const { lang } = await params;

  const Dashboard = () => {
    return (
      <div className="flex flex-1 ">
        <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border dark:bg-brand-surfacedark bg-brand-surface   p-2 md:p-10 dark:border-neutral-700 text-text-light dark:text-text-lightdark">
          {children}
        </div>
      </div>
    );
  };

  return (
    <AdminSidebar >
      <Dashboard />
    </AdminSidebar>
  );
} 