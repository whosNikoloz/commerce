import type { Metadata } from "next";

import { headers } from "next/headers";

import { i18nPageMetadataAsync, getActiveSite } from "@/lib/seo";
import { Locale, locales } from "@/i18n.config";
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

  // Use ogImage if available, otherwise fallback to logo
  const ogImage = site.ogImage && site.ogImage.trim() ? site.ogImage : site.logo;

  return i18nPageMetadataAsync({
    title: site.name ?? "Home",
    description:
      site.description ??
      "Premium products, fast delivery, secure checkout. Discover what's new, in stock, and on sale.",
    lang,
    path: "/",
    images: [ogImage],
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

  // Get original pathname to detect actual locale
  const originalPathname = headersList.get("x-pathname") || "";
  const availableLocales = tenant?.siteConfig?.locales || [...locales];
  const tenantDefaultLocale = tenant?.siteConfig?.localeDefault || "ka";

  // Detect if the original URL had a locale prefix
  const pathParts = originalPathname.split("/").filter(Boolean);
  const firstSegment = pathParts[0]?.toLowerCase();
  const hasLocaleInPath = firstSegment && /^[a-z]{2,3}$/.test(firstSegment);

  // Determine the actual locale to use
  let actualLocale: string;

  if (hasLocaleInPath && availableLocales.includes(firstSegment)) {
    // User explicitly requested a locale in the URL
    actualLocale = firstSegment;
  } else {
    // No locale in original path, use tenant's default
    actualLocale = tenantDefaultLocale;
  }

  return <HomeRenderer locale={actualLocale as Locale} tenant={tenant} />;
}
