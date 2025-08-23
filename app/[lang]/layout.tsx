import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";
import { LayoutWrapper } from "./LayoutWrapper";

import { site } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Locale } from "@/i18n.config";
import { getTranslations } from "@/lib/get-dictionary";

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
  params: { lang: Locale };
}) {
  const { lang } = await params;
  const dictionary = await getTranslations(lang);

  return (
    <html suppressHydrationWarning lang={lang}>
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased bg-brand-muted dark:bg-brand-surfacedark",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
