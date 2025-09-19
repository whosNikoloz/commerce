// app/[lang]/layout.tsx (RootLayout)
import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

import clsx from "clsx";
import { headers } from "next/headers";

import { Providers } from "./providers";
import { LayoutWrapper } from "./LayoutWrapper";

import { fontSans } from "@/config/fonts";
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/lib/seo";
import { locales, defaultLocale } from "@/i18n.config";
import BackToTopShadcn from "@/components/back_to_top";
import { themeToStyle } from "@/lib/applyTheme";
import { getTenantByHostStatic } from "@/lib/getTenantByHost";
import { getSiteByHost } from "@/lib/getSiteByHost";
import ClientUADataFix from "@/components/ClientUADataFix";

function normalizeHost(host?: string) {
  return (host ?? "").toLowerCase().replace(/:.*$/, "").replace(",", ".");
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = normalizeHost(h.get("x-forwarded-host") ?? h.get("host") ?? "");
  const site = getSiteByHost(host);

  const base = site.url.replace(/\/$/, "");
  const ogImageAbs = `${base}${site.ogImage}`;

  return {
    metadataBase: new URL(site.url),
    title: { default: site.name, template: `%s • ${site.shortName}` },
    description: site.description,
    openGraph: {
      type: "website",
      url: site.url,
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
  const tenant = getTenantByHostStatic(host);
  const site = getSiteByHost(host);
  const style = themeToStyle(tenant.theme);

  return (
    <html suppressHydrationWarning lang={safeLang} style={style}>
      <head>
        <link href={site.favicon} rel="icon" sizes="any" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
          rel="stylesheet"
        />
        {/* JSON-LD with per-host site info */}
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd(site)) }}
          type="application/ld+json"
        />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteJsonLd(site)) }}
          type="application/ld+json"
        />

        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-brand-muted dark:bg-brand-muteddark font-sans antialiased",
          fontSans.variable,
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
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
