import type { Metadata } from "next";

import { headers } from "next/headers";

import { i18nPageMetadataAsync, getActiveSite } from "@/lib/seo";
import { Locale } from "@/i18n.config";
import { getTenantByHost } from "@/lib/getTenantByHost";
import HomeRenderer from "@/components/Home/HomeRenderer";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const site = await getActiveSite();

  return i18nPageMetadataAsync({
    title: site.name ?? "Home",
    description:
      site.description ??
      "Premium products, fast delivery, secure checkout. Discover what's new, in stock, and on sale.",
    lang,
    path: "/",
    images: [site.ogImage],
    index: true,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const headersList = await headers();
  const host = (headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000")
    .replace(/^www\./, "")
    .toLowerCase();

  // Get tenant configuration dynamically from API
  const tenant = await getTenantByHost(host);

  return <HomeRenderer locale={lang} tenant={tenant} />;
}
