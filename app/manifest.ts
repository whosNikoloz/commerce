import type { MetadataRoute } from "next";

import { headers } from "next/headers";

import { getTenantByHost } from "@/lib/getTenantByHost";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const tenant = await getTenantByHost(host);
  const site = tenant.siteConfig;
  const pwa = site.pwa || {};

  // Build manifest with PWA config or sensible defaults
  const manifestData: MetadataRoute.Manifest = {
    name: site.name,
    short_name: site.shortName || site.name,
    description: site.description || `Shop ${site.name} - Your trusted online store`,
    start_url: pwa.startUrl || "/",
    display: pwa.display || "standalone",
    background_color: pwa.backgroundColor || "#ffffff",
    theme_color: pwa.themeColor || tenant.themeColor || "#000000",
    orientation: pwa.orientation || "portrait-primary",
    icons: [
      {
        src: site.logo || site.favicon,
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: pwa.categories || ["shopping", "business", "ecommerce"],
    prefer_related_applications: false,
    scope: pwa.scope || "/",
    lang: site.localeDefault || "ka",
    dir: "ltr",
  };

  // Add shortcuts if configured
  if (pwa.shortcuts && pwa.shortcuts.length > 0) {
    manifestData.shortcuts = pwa.shortcuts.map(s => ({
      name: s.name,
      url: s.url,
      description: s.description,
    }));
  }

  return manifestData;
}
