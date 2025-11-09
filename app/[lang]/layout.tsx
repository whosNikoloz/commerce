import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

import clsx from "clsx";
import { headers } from "next/headers";

import { Providers } from "./providers";
import { LayoutWrapper } from "./LayoutWrapper";

import { buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/lib/seo";
import { locales, defaultLocale } from "@/i18n.config";
import BackToTopShadcn from "@/components/back_to_top";
import { themeToStyle } from "@/lib/applyTheme";
import { getTenantByHost } from "@/lib/getTenantByHost";
import ClientUADataFix from "@/components/ClientUADataFix";
import { generateFontClassNames } from "@/lib/loadTenantFonts";
import FloatingCompareButton from "@/components/compare/FloatingCompareButton";

function normalizeHost(host?: string) {
  return (host ?? "").toLowerCase().replace(/:.*$/, "").replace(",", ".");
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = normalizeHost(h.get("x-forwarded-host") ?? h.get("host") ?? "");
  const tenant = await getTenantByHost(host);
  const site = tenant.siteConfig;

  const base = site.url ? site.url.replace(/\/$/, "") : `http://${host}`;
  const ogImageAbs = site.ogImage ? `${base}${site.ogImage}` : `${base}/og-image.jpg`;

  return {
    metadataBase: new URL(base),
    title: { default: site.name, template: `%s • ${site.shortName}` },
    description: site.description,
    openGraph: {
      type: "website",
      url: base,
      title: site.name,
      description: site.description,
      siteName: site.name,
      images: [{ url: ogImageAbs, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: site.description,
      images: [ogImageAbs],
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
  //console.log("🏗️ [LAYOUT SSR] Tenant loaded for host:", host, "→", tenant.siteConfig.name);
  const site = tenant.siteConfig;
  const style = themeToStyle(tenant.theme);
  const fontClassNames = generateFontClassNames(tenant.theme);

  // Build JSON-LD asynchronously
  const organizationJsonLd = await buildOrganizationJsonLd(site);
  const websiteJsonLd = await buildWebsiteJsonLd(site);

  return (
    <html suppressHydrationWarning lang={safeLang} style={style}>
      <head>
        <meta content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5" name="viewport" />
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta content="#ffffff" name="theme-color" />
        <meta content="#ffffff" name="msapplication-TileColor" />
        <link href={site.favicon} rel="icon" sizes="any" />
        <link href={site.favicon} rel="apple-touch-icon" />
        <link href="/manifest.json" rel="manifest" />

        {/* Resource hints for performance */}
        <link href="https://cdnjs.cloudflare.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://cdnjs.cloudflare.com" rel="dns-prefetch" />

        {/* Preconnect to image CDN sources */}
        <link crossOrigin="anonymous" href="https://media.veli.store" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://extra.ge" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://ecommerce-outdoor.s3.eu-north-1.amazonaws.com" rel="preconnect" />

        {/* Font Awesome - loaded with low priority */}
        <link
          crossOrigin="anonymous"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
          rel="stylesheet"
        />
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
      </head>
      <body
        className={clsx(
          "min-h-screen bg-brand-surface dark:bg-brand-surfacedark font-sans antialiased ",
          fontClassNames,
        )}
      >
        <Providers
          initialTenant={tenant}
          themeProps={{ attribute: "class", defaultTheme: tenant.theme.mode }}
        >
          <LayoutWrapper>
            <ClientUADataFix />
            {children}
            <BackToTopShadcn threshold={320} />
            <FloatingCompareButton />
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
