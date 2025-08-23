// src/lib/seo.ts
import type { Metadata } from "next";

import { site as siteConfig } from "@/config/site";

export type BaseMetaArgs = {
  /** Page-specific title (string only; the layout adds the template) */
  title: string;
  description?: string;
  /** Absolute canonical URL, e.g. https://example.com/en/product/123 */
  url: string;
  images?: string[];
  siteName?: string;
  index?: boolean;
  /** Optional: i18n alternates, e.g. { en: '...', ka: '...' } */
  alternates?: Record<string, string>;
};

export function toAbsoluteImages(images?: string[]): string[] {
  const base = siteConfig.url.replace(/\/$/, "");
  const list = (images ?? []).map((src) => (src.startsWith("http") ? src : `${base}${src}`));

  return list.length ? list : [base + siteConfig.ogImage];
}

export function basePageMetadata({
  title,
  description = siteConfig.description,
  url,
  images,
  siteName = siteConfig.name,
  index = true,
  alternates,
}: BaseMetaArgs): Metadata {
  const absImages = toAbsoluteImages(images);

  return {
    title,
    description,
    robots: index ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
    alternates: {
      canonical: url,
      languages: alternates,
    },
    openGraph: {
      type: "website",
      url,
      siteName,
      title,
      description,
      images: absImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: absImages,
    },
  };
}

/* ---------------- JSON-LD builders ---------------- */

export function buildProductJsonLd(args: {
  name: string;
  description?: string;
  images?: string[];
  brand?: string;
  category?: string;
  url: string;
  price: number | string;
  currency: string;
  availability: string;
  condition: string;
}) {
  const {
    name,
    description,
    images,
    brand,
    category,
    url,
    price,
    currency,
    availability,
    condition,
  } = args;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images && images.length ? images : undefined,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    category,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: String(price),
      availability,
      itemCondition: condition,
    },
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function buildItemListJsonLd(items: Array<{ name: string; url: string; image?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: p.url,
      item: {
        "@type": "Product",
        name: p.name,
        image: p.image,
        url: p.url,
      },
    })),
  };
}

export function buildOrganizationJsonLd() {
  const base = siteConfig.url.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: base,
    logo: base + siteConfig.logo, // add `logo` in your site config
    sameAs: siteConfig.links
      ? Object.values(siteConfig.links).filter((v) => typeof v === "string" && v.startsWith("http"))
      : [],
  };
}

export function buildWebsiteJsonLd() {
  const base = siteConfig.url.replace(/\/$/, "");
  // If your search lives at /[lang]/category?q=, we give one example for the default locale:
  const searchUrl = `${base}/${siteConfig.localeDefault}/category?q={search_term_string}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: searchUrl,
      "query-input": "required name=search_term_string",
    },
  };
}
