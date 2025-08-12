// app/sitemap.ts
import type { MetadataRoute } from "next";

const SITE_URL = "https://yourdomain.com";
const LOCALES = ["en", "ka"];

// ეს ფუნქციები ჩაანაცვლე რეალური API-ებით
async function getAllCategoryPaths(): Promise<string[]> {
    // მაგ.: ["cameras", "cameras/mirrorless", "laptops"]
    return ["cameras", "cameras/mirrorless", "laptops"];
}

async function getAllProductSlugs(): Promise<string[]> {
    // მაგ.: ["sony-a7-iv", "canon-r6-ii", "macbook-pro-14"]
    return ["sony-a7-iv", "canon-r6-ii", "macbook-pro-14"];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // სტატიკური გვერდები
    const staticPaths = [
        "",
        "about",
        "contact",
        "shipping",
        "returns",
        "privacy",
        "terms",
        "help",
        "faq",
        "stores",
    ];

    const categories = await getAllCategoryPaths();
    const products = await getAllProductSlugs();

    const entries: MetadataRoute.Sitemap = [];

    // სტატიკური + ლოკალები
    for (const locale of LOCALES) {
        for (const path of staticPaths) {
            const url = `${SITE_URL}/${locale}/${path}`.replace(/\/+$/, "");
            entries.push({
                url,
                lastModified: now,
                changeFrequency: "monthly",
                priority: 0.7,
            });
        }
    }

    // კატეგორიები
    for (const locale of LOCALES) {
        for (const c of categories) {
            entries.push({
                url: `${SITE_URL}/${locale}/${c}`,
                lastModified: now,
                changeFrequency: "daily",
                priority: 0.8,
            });
        }
    }

    // პროდუქტები
    for (const locale of LOCALES) {
        for (const slug of products) {
            entries.push({
                url: `${SITE_URL}/${locale}/product/${slug}`,
                lastModified: now,
                changeFrequency: "daily",
                priority: 0.9,
            });
        }
    }

    return entries;
}
