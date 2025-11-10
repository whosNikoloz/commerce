import type { Metadata } from "next";

import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { i18nPageMetadataAsync } from "@/lib/seo";
import { Locale } from "@/i18n.config";
import { getTenantByHost } from "@/lib/getTenantByHost";
import PageRenderer from "@/components/DynamicPage/PageRenderer";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const headersList = await headers();
  const host = (headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000")
    .replace(/^www\./, "")
    .toLowerCase();

  // Get tenant configuration dynamically from API
  const tenant = await getTenantByHost(host);
  const site = tenant.siteConfig;

  // Find the dynamic page
  const dynamicPage = tenant.dynamicPages?.pages.find(page => page.slug === slug);

  if (!dynamicPage) {
    return {
      title: "Page Not Found",
      description: "The requested page does not exist.",
    };
  }

  // Use page-specific ogImage, or fallback to site ogImage, or finally to logo
  const ogImage = dynamicPage.metadata.ogImage
    || (site.ogImage && site.ogImage.trim() ? site.ogImage : site.logo);

  return i18nPageMetadataAsync({
    title: dynamicPage.metadata.title[lang],
    description: dynamicPage.metadata.description[lang],
    lang,
    path: `/${slug}`,
    images: [ogImage],
    index: dynamicPage.metadata.index ?? true,
  });
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}) {
  const { lang, slug } = await params;
  const headersList = await headers();
  const host = (headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000")
    .replace(/^www\./, "")
    .toLowerCase();

  // Get tenant configuration dynamically from API
  const tenant = await getTenantByHost(host);

  // Check if the dynamic page exists
  const dynamicPage = tenant.dynamicPages?.pages.find(page => page.slug === slug);

  if (!dynamicPage || !dynamicPage.active) {
    notFound();
  }

  return <PageRenderer locale={lang} pageSlug={slug} tenant={tenant} />;
}
