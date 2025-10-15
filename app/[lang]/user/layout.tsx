import "@/styles/globals.css";
import type { Viewport, Metadata } from "next";

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
    title: "User Panel",
    description: "User dashboard.",
    lang,
    path: "/admin",
    index: false, // noindex admin
  });
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl dark:bg-brand-surfacedark bg-brand-surface p-2 md:p-10 text-text-light dark:text-text-lightdark">
        {children}
      </div>
    </div>
  );
}
