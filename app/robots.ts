// app/robots.ts
import type { MetadataRoute } from "next";

import { headers } from "next/headers";

import { locales } from "@/i18n.config";
import { getTenantByHost } from "@/lib/getTenantByHost";

export const dynamic = "force-dynamic"; // read Host header per request

// Optional: if you want different "allowed exact" URLs per tenant, put them here.
const PER_HOST_ALLOWED_EXACT: Record<string, string[]> = {
  // "commerce-sxvadomain.vercel.app": ["/en/category/...."],
  // "commerce-topaz-sigma-62.vercel.app": [],
};

function normalizeHost(host?: string) {
  return (host ?? "").toLowerCase().replace(/:.*$/, "").replace(",", ".");
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const rawHost = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const host = normalizeHost(rawHost);

  const tenant = await getTenantByHost(host);
  const site = tenant.siteConfig;
  const BASE = site.url ? site.url.replace(/\/$/, "") : `http://${host}`;

  // Global or per-host exact allow list (avoid if you don't truly need it)
  // Use canonical tags in your pages instead of explicit allows for query params
  const allowedExact = PER_HOST_ALLOWED_EXACT[host] ?? [];

  // Internal paths never meant for crawling
  const disallowCore = ["/api/", "/_next/", "/static/", "/cdn-cgi/rum"];

  // Query patterns that explode URL variants
  // Note: Only block tracking and redundant parameters, not core functionality
  const disallowQueryPatterns = [
    "/*utm_*",        // UTM tracking parameters
    "/*?fbclid=*",    // Facebook click tracking
    "/*?gclid=*",     // Google click tracking
    "/*?ref=*",       // Referral tracking
  ];

  // Non-locale top-level sections to block
  const disallowTopLevel = [
    "/admin",
    "/admin/",
    "/user",
    "/user/",
    "/wishlists/",
    "/cart*",
    "/checkout*",
    "/order-confirmation*",
  ];

  // Same blocks but under each locale (/en, /ka, …)
  const disallowPerLocale = locales.flatMap((l) => [
    `/${l}/admin`,
    `/${l}/admin/`,
    `/${l}/cart*`,
    `/${l}/checkout*`,
  ]);

  // Helpful allows so crawlers traverse main sections confidently
  const allowSectionPrefixes = locales.flatMap((l) => [
    `/${l}/`,
    `/${l}/category/`,
    `/${l}/product/`,
    `/${l}/info/`,
  ]);

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...allowSectionPrefixes, ...allowedExact],
        disallow: [
          ...disallowCore,
          ...disallowQueryPatterns,
          ...disallowTopLevel,
          ...disallowPerLocale,
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE, // non-standard but supported by Next's type; ok to keep
  };
}
