import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

import clsx from "clsx";

import { Providers } from "./providers";
import { LayoutWrapper } from "./LayoutWrapper";

import { site } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/lib/seo";
import { locales, defaultLocale } from "@/i18n.config";
import BackToTopShadcn from "@/components/back_to_top";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s • ${site.shortName}` },
  description: site.description,
  openGraph: { siteName: site.name, images: [site.ogImage] },
  twitter: { card: "summary_large_image", images: [site.ogImage] },
};

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

  // guard the lang to one of our supported locales
  const safeLang = (locales as readonly string[]).includes(lang)
    ? (lang as (typeof locales)[number])
    : defaultLocale;

  return (
    <html suppressHydrationWarning lang={safeLang}>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
          type="application/ld+json"
        />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteJsonLd()) }}
          type="application/ld+json"
        />

        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-brand-muted dark:bg-brand-surfacedark font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <LayoutWrapper>
            {children}
            <BackToTopShadcn threshold={320} />
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
