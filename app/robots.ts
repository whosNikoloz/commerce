// app/robots.ts
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { locales } from "@/i18n.config";
import { getSiteByHost } from "@/lib/getSiteByHost";

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

  const site = getSiteByHost(host);
  const BASE = site.url.replace(/\/$/, "");

  // Global or per-host exact allow list (avoid if you don't truly need it)
  const allowedExact = PER_HOST_ALLOWED_EXACT[host] ?? [
    "/en/category/0198d5ef-77a7-7ea0-9d44-eaa26609d5d4?page=1&sort=featured&brand=0198eb1d-5ba1-7f41-980a-640e84ea7328&cond=0&stock=0&min=0&max=580",
  ];

  // Internal paths never meant for crawling
  const disallowCore = ["/api/", "/_next/", "/static/", "/cdn-cgi/rum"];

  // Query patterns that explode URL variants
  const disallowQueryPatterns = [
    "*?q=*",
    "*sort=*",
    "*?filter_options=*",
    "/*utm_*",
    "/*?max*",
    "/*?min*",
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
