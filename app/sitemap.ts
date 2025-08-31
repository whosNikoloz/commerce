// app/sitemap.ts
import type { MetadataRoute } from "next";

import { getAllProducts } from "@/app/api/services/productService";
import { getAllCategories } from "@/app/api/services/categoryService";
import { site as siteConfig } from "@/config/site";
import { locales } from "@/i18n.config";

export const revalidate = 86400;
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const statics = ["", "/category"].flatMap((p) =>
    locales.map((lng) => ({
      url: `${base}/${lng}${p}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: p === "" ? 1.0 : 0.7,
    })),
  );

  const cats = await getAllCategories().catch(() => [] as any[]);
  const catUrls = cats.flatMap((c: any) =>
    locales.map((lng) => ({
      url: `${base}/${lng}/category/${c.id}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  const prods = await getAllProducts().catch(() => [] as any[]);
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
