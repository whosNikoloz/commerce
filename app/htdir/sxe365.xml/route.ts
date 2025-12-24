import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { getAllProducts } from "@/app/api/services/productService";
import { getAllCategories } from "@/app/api/services/categoryService";
import { getTenantByHost } from "@/lib/getTenantByHost";
import { locales } from "@/i18n.config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
    const tenant = await getTenantByHost(host);
    const site = tenant.siteConfig;
    const base = site.url ? site.url.replace(/\/$/, "") : `http://${host}`;
    const now = new Date();

    let products: any[] = [];
    let categories: any[] = [];

    try {
      products = await getAllProducts();
    } catch {}

    try {
      categories = await getAllCategories();
    } catch {}

    // Generate URLs for all products and categories
    const productUrls = products.flatMap((p: any) =>
      locales.map((lng) => ({
        loc: `${base}/${lng}/product/${p.id}`,
        lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : now.toISOString(),
        changefreq: "daily",
        priority: 0.8,
      }))
    );

    const categoryUrls = categories.flatMap((c: any) =>
      locales.map((lng) => ({
        loc: `${base}/${lng}/category/${c.id}`,
        lastmod: c.updatedAt ? new Date(c.updatedAt).toISOString() : now.toISOString(),
        changefreq: "weekly",
        priority: 0.7,
      }))
    );

    const allUrls = [...productUrls, ...categoryUrls];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Error generating htdir sitemap:", error);

    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      {
        headers: {
          "Content-Type": "application/xml",
        },
        status: 200,
      }
    );
  }
}
