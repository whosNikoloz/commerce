import type { Metadata } from "next";
import type { Locale, InfoPageSlug, SiteConfig } from "@/types/tenant";

import { headers } from "next/headers";

import InfoPageRenderer from "./InfoPageRenderer";

import { i18nPageMetadataAsync, getActiveSite, buildBreadcrumbJsonLd, buildI18nUrls } from "@/lib/seo";
import { getTenantByHost } from "@/lib/getTenantByHost";

interface InfoPageRouteProps {
  params: Promise<{ lang: Locale }>;
  slug: InfoPageSlug;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

// JSON-LD helper
async function JsonLd({ lang, site, slug, title }: { lang: string; site: SiteConfig; slug: string; title: string }) {
  if (site.seo?.enableBreadcrumbs === false) return null;

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
  const description = pageConfig?.metadata.description[lang as keyof typeof pageConfig.metadata.description]
    || fallbackDescription
    || `${title} - ${site.description || 'Learn more about our services and offerings'}`;

  // Use page-specific ogImage, or fallback to site ogImage, or finally to logo
  const ogImage = pageConfig?.metadata.ogImage
    || (site.ogImage && site.ogImage.trim() ? site.ogImage : site.logo);

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
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center min-h-[380px] p-8">
          <div className="text-center space-y-4 max-w-lg mx-auto">
            <h2 className="font-heading text-3xl font-semibold text-brand-primary dark:text-brand-primarydark">
              Coming Soon
            </h2>

            <p className="font-primary text-text-subtle dark:text-text-subtledark leading-relaxed">
              We’re preparing this page to bring you helpful information soon.
              <br />
              The <span className="font-primary font-medium text-text-light dark:text-text-lightdark">
                “{slug}”
              </span>{" "}
              section is currently being set up.
            </p>

            <p className="font-primary text-sm text-text-subtle dark:text-text-subtledark">
              Please check back a little later 🌿
            </p>
          </div>
        </div>
      </div>

    );
  }

  const pageTitle = pageConfig.metadata.title[lang] ?? '';

  return (
    <>
      {await JsonLd({ lang, site, slug, title: pageTitle })}
      <InfoPageRenderer locale={lang} pageConfig={pageConfig.config} />
    </>
  );
}
