import type { MetadataRoute } from "next";

import { headers } from "next/headers";

import { getAllProducts } from "@/app/api/services/productService";
import { getAllCategories } from "@/app/api/services/categoryService";
import { locales } from "@/i18n.config";
import { getTenantByHost } from "@/lib/getTenantByHost";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const tenant = await getTenantByHost(host);
  const site = tenant.siteConfig;
  const base = site.url ? site.url.replace(/\/$/, "") : `http://${host}`;
  const now = new Date();

  // Static pages including info pages
  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/category", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/info/about", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/info/privacy-policy", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/info/terms-and-conditions", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/info/delivery", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/info/return-policy", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/info/guarantee", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/info/faq", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/info/stores", priority: 0.6, changeFrequency: "weekly" as const },
  ];

  const statics = staticPages.flatMap((page) =>
    locales.map((lng) => ({
      url: `${base}/${lng}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
  );

  let cats: any[] = [];
  let prods: any[] = [];

  try {
    cats = await getAllCategories();
  } catch {}
  try {
    prods = await getAllProducts();
  } catch {}

  const catUrls = cats.flatMap((c: any) =>
    locales.map((lng) => ({
      url: `${base}/${lng}/category/${c.id}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  const prodUrls = prods.flatMap((p: any) =>
    locales.map((lng) => ({
      url: `${base}/${lng}/product/${p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  );

  return [...statics, ...catUrls, ...prodUrls];
}
