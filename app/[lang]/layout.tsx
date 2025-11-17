import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

import clsx from "clsx";
import { headers } from "next/headers";

import { Providers } from "./providers";
import { LayoutWrapper } from "./LayoutWrapper";

import FontAwesomeLoader from "@/components/FontAwesomeLoader";
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/lib/seo";
import { locales, defaultLocale } from "@/i18n.config";
import BackToTopShadcn from "@/components/back_to_top";
import { themeToStyle } from "@/lib/applyTheme";
import { getTenantByHost } from "@/lib/getTenantByHost";
import ClientUADataFix from "@/components/ClientUADataFix";
import { generateFontClassNames } from "@/lib/loadTenantFonts";
import FloatingCompareButton from "@/components/compare/FloatingCompareButton";
import AnalyticsScripts from "@/components/Analytics/AnalyticsScripts";

function normalizeHost(host?: string) {
  return (host ?? "").toLowerCase().replace(/:.*$/, "").replace(",", ".");
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = normalizeHost(h.get("x-forwarded-host") ?? h.get("host") ?? "");
  const tenant = await getTenantByHost(host);
  const site = tenant.siteConfig;
  const seo = site.seo || {};

  const base = site.url ? site.url.replace(/\/$/, "") : `http://${host}`;

  // Use ogImage if available, otherwise fallback to logo
  const ogImagePath = site.ogImage && site.ogImage.trim() ? site.ogImage : site.logo;
  const ogImageAbs = ogImagePath.startsWith("http") ? ogImagePath : `${base}${ogImagePath}`;

  // Build verification object
  const verification: Record<string, string> = {};

  if (seo.googleSiteVerification) verification.google = seo.googleSiteVerification;
  if (seo.bingSiteVerification) verification.bing = seo.bingSiteVerification;
  if (seo.yandexVerification) verification.yandex = seo.yandexVerification;
  if (seo.pinterestVerification) verification.pinterest = seo.pinterestVerification;

  return {
    metadataBase: new URL(base),
    title: { default: site.name, template: `%s • ${site.shortName || site.name}` },
    description: site.description,
    keywords: seo.keywords?.ka || seo.keywords?.en,
    authors: seo.author ? [{ name: seo.author }] : undefined,
    creator: seo.author,
    publisher: site.name,
    verification: Object.keys(verification).length > 0 ? verification : undefined,
    openGraph: {
      type: (seo.ogType as any) || "website",
      url: base,
      title: site.name,
      description: site.description,
      siteName: seo.ogSiteName?.ka || seo.ogSiteName?.en || site.name,
      images: [{ url: ogImageAbs, width: 1200, height: 630 }],
      locale: seo.ogLocale || "ka_GE",
    },
    twitter: {
      card: seo.twitterCard || "summary_large_image",
      title: site.name,
      description: site.description,
      images: [ogImageAbs],
      site: seo.twitterSite,
      creator: seo.twitterCreator,
    },
    icons: { icon: site.favicon },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const safeLang = (locales as readonly string[]).includes(lang)
    ? (lang as (typeof locales)[number])
    : defaultLocale;

  const h = await headers();
  const host = normalizeHost(h.get("x-forwarded-host") ?? h.get("host") ?? "");
  const tenant = await getTenantByHost(host);
  const site = tenant.siteConfig;
  const seo = site.seo || {};
  const style = themeToStyle(tenant.theme);
  const fontClassNames = generateFontClassNames(tenant.theme);

  // Build JSON-LD asynchronously
  const organizationJsonLd = await buildOrganizationJsonLd(site);
  const websiteJsonLd = await buildWebsiteJsonLd(site);

  // Get dynamic theme color from PWA config or tenant theme
  const themeColor = site.pwa?.themeColor || tenant.themeColor || "#000000";

  return (
    <html suppressHydrationWarning lang={safeLang} style={style}>
      <head>
        <meta content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5" name="viewport" />
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta content={themeColor} name="theme-color" />
        <meta content={themeColor} name="msapplication-TileColor" />
        <link href={site.favicon} rel="icon" sizes="any" />
        <link href={site.favicon} rel="apple-touch-icon" />

        {/* Resource hints for performance */}
        <link href="https://cdnjs.cloudflare.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://cdnjs.cloudflare.com" rel="dns-prefetch" />

        {/* Preconnect to image CDN sources */}
        <link crossOrigin="anonymous" href="https://media.veli.store" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://extra.ge" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://ecommerce-outdoor.s3.eu-north-1.amazonaws.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://finasyncecomm.s3.eu-central-1.amazonaws.com" rel="dns-prefetch" />

        {/* API preconnect for better performance */}
        {process.env.NEXT_PUBLIC_API_URL && (
          <link crossOrigin="anonymous" href={new URL(process.env.NEXT_PUBLIC_API_URL).origin} rel="preconnect" />
        )}

        {/* Preload critical images */}
        <link as="image" href={site.logo} rel="preload" />
        {site.ogImage && site.ogImage !== site.logo && <link as="image" href={site.ogImage} rel="preload" />}

        <style
          dangerouslySetInnerHTML={{
            __html: `@font-face{font-display:swap;}`,
          }}
        />
        {/* JSON-LD with per-host site info */}
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          type="application/ld+json"
        />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          type="application/ld+json"
        />

        {/* Analytics and Tracking Scripts */}
        <AnalyticsScripts seo={seo} />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-brand-surface dark:bg-brand-surfacedark font-sans antialiased ",
          fontClassNames,
        )}
      >
        {/* GTM noscript fallback for body */}
        {seo.googleTagManagerId && (
          <noscript>
            <iframe
              height="0"
              src={`https://www.googletagmanager.com/ns.html?id=${seo.googleTagManagerId}`}
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
              width="0"
            />
          </noscript>
        )}

        <Providers
          initialTenant={tenant}
          themeProps={{ attribute: "class", defaultTheme: tenant.theme.mode }}
        >
          <FontAwesomeLoader />
          {/* <WebVitals /> */}
          <LayoutWrapper>
            <ClientUADataFix />
            <main className="" id="main-content">
              {children}
            </main>
            <BackToTopShadcn threshold={320} />
            <FloatingCompareButton />
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
