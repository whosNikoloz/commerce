import type { Metadata } from "next";

import { headers } from "next/headers";

import { i18nPageMetadataAsync, getActiveSite, buildBreadcrumbJsonLd, buildI18nUrls } from "@/lib/seo";
import { getTenantByHost } from "@/lib/getTenantByHost";
import type { Locale, InfoPageSlug, SiteConfig } from "@/types/tenant";
import InfoPageRenderer from "./InfoPageRenderer";

interface InfoPageRouteProps {
  params: Promise<{ lang: Locale }>;
  slug: InfoPageSlug;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

// JSON-LD helper
async function JsonLd({ lang, site, slug, title }: { lang: string; site: SiteConfig; slug: string; title: string }) {
  const home = (await buildI18nUrls("/", lang, site)).canonical;
  const info = (await buildI18nUrls("/info", lang, site)).canonical;
  const page = (await buildI18nUrls(`/info/${slug}`, lang, site)).canonical;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "მთავარი", url: home },
    { name: "ინფო", url: info },
    { name: title, url: page },
  ]);

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      type="application/ld+json"
    />
  );
}

// Generate metadata for the info page
export async function generateInfoPageMetadata({
  params,
  slug,
  fallbackTitle,
  fallbackDescription,
}: InfoPageRouteProps): Promise<Metadata> {
  const { lang } = await params;
  const site = await getActiveSite();
  const headersList = await headers();
  const host = (headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000")
    .replace(/^www\./, "")
    .toLowerCase();

  const tenant = await getTenantByHost(host);

  // Find the page config for this slug
  const pageConfig = tenant?.infoPages?.pages.find(p => p.slug === slug);

  // Use configured metadata or fallback values
  const title = pageConfig?.metadata.title[lang as keyof typeof pageConfig.metadata.title] || fallbackTitle || slug;
  const description = pageConfig?.metadata.description[lang as keyof typeof pageConfig.metadata.description] || fallbackDescription || "";
  const ogImage = pageConfig?.metadata.ogImage || "/og/info-og.jpg";
  const index = pageConfig?.metadata.index !== false; // Default to true

  return i18nPageMetadataAsync({
    title,
    description,
    lang,
    path: `/info/${slug}`,
    images: [ogImage],
    index,
    siteOverride: site,
  });
}

// Render the info page
export async function renderInfoPage({ params, slug }: { params: Promise<{ lang: Locale }>; slug: InfoPageSlug }) {
  const { lang } = await params;
  const site = await getActiveSite();
  const headersList = await headers();
  const host = (headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000")
    .replace(/^www\./, "")
    .toLowerCase();

  const tenant = await getTenantByHost(host);

  // Find the page config for this slug
  const pageConfig = tenant?.infoPages?.pages.find(p => p.slug === slug);

  if (!pageConfig) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Page Not Configured
            </h2>
            <p className="text-gray-600">
              This info page has not been configured yet. Please add configuration for "{slug}" in your tenant settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pageTitle = pageConfig.metadata.title[lang];

  return (
    <>
      {await JsonLd({ lang, site, slug, title: pageTitle })}
      <InfoPageRenderer pageConfig={pageConfig.config} locale={lang} />
    </>
  );
}
