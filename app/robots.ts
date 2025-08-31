// app/robots.ts
import type { MetadataRoute } from "next";

import { site as siteConfig } from "@/config/site";
import { locales } from "@/i18n.config";

export const revalidate = 3600; // refresh robots once per hour (optional)
export const dynamic = "force-static"; // make sure it's served as static

const BASE = siteConfig.url.replace(/\/$/, "");

// Exact URLs you want indexed even though we block most query combos
const ALLOWED_EXACT: string[] = [
  // your filtered category page (exact match)
  "/en/category/0198d5ef-77a7-7ea0-9d44-eaa26609d5d4?page=1&sort=featured&brand=0198eb1d-5ba1-7f41-980a-640e84ea7328&cond=0&stock=0&min=0&max=580",
];

export default function robots(): MetadataRoute.Robots {
  // Internal paths never meant for crawling
  const disallowCore = ["/api/", "/_next/", "/static/", "/cdn-cgi/rum"];

  // Generic query patterns that create infinite variants
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

  // Helpful allows so crawlers confidently traverse main sections
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
        allow: ["/", ...allowSectionPrefixes, ...ALLOWED_EXACT],
        disallow: [
          ...disallowCore,
          ...disallowQueryPatterns,
          ...disallowTopLevel,
          ...disallowPerLocale,
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
