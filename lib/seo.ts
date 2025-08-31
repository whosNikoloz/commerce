// src/lib/seo.ts
import type { Metadata } from "next";

import { site as siteConfig } from "@/config/site";
import { locales, type Locale, defaultLocale } from "@/i18n.config";

/* ---------------- helpers ---------------- */

const BASE = siteConfig.url.replace(/\/$/, "");
const ensureLeadingSlash = (p: string) => (p.startsWith("/") ? p : `/${p}`);

const toPlain = (s: string) =>
  s
    ?.replace(/<[^>]*>/g, " ") // strip HTML
    .replace(/\s+/g, " ")
    .trim();

const clamp = (s: string, max = 160) => (s.length <= max ? s : s.slice(0, max - 1).trim() + "…");

/** Always return a safe meta description (Lighthouse requirement) */
export function ensureMetaDescription(input?: string): string {
  const base = toPlain(input || "") || toPlain(siteConfig.description || "") || " ";

  // never return empty; some crawlers treat truly empty as missing
  return clamp(base || " ", 160);
}

export function toAbsoluteImages(images?: string[]): string[] {
  const list = (images ?? []).map((src) => (src.startsWith("http") ? src : `${BASE}${src}`));

  return list.length ? list : [BASE + siteConfig.ogImage];
}

/** Build canonical + language alternates for a *localized* path */
export function buildI18nUrls(path: string, lang: string | Locale) {
  const l = (lang as string) || defaultLocale;
  const clean = ensureLeadingSlash(path);

  // If caller passed a localized path (/en/... or /ka/...), normalize away the first segment
  const segments = clean.split("/").filter(Boolean);
  const first = segments[0];
  const normalized = locales.includes(first as Locale) ? `/${segments.slice(1).join("/")}` : clean;

  const canonical = `${BASE}/${l}${normalized}`;
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((loc) => [loc, `${BASE}/${loc}${normalized}`]),
  );

  return { canonical, languages };
}

const ogLocale = (lang: string | Locale) => String(lang).toLowerCase(); // e.g. "en", "ka"

/* ---------------- metadata builders ---------------- */

export type I18nMetaArgs = {
  /** Page-specific title (string only; root layout adds template) */
  title: string;
  description?: string;
  /** Current locale */
  lang: Locale | string;
  /** Path without host, e.g. `/product/123` or `/info/faq` (with or without lang prefix; both OK) */
  path: string;
  images?: string[];
  siteName?: string;
  index?: boolean;
  /** If you need to override alternates manually (rare) */
  alternatesOverride?: Record<string, string>;
};

export function i18nPageMetadata({
  title,
  description,
  lang,
  path,
  images,
  siteName = siteConfig.name,
  index = true,
  alternatesOverride,
}: I18nMetaArgs): Metadata {
  const desc = ensureMetaDescription(description);
  const absImages = toAbsoluteImages(images);
  const { canonical, languages } = buildI18nUrls(path, lang);
  const langs = alternatesOverride ?? languages;
  const alternateLocales = locales.filter((l) => l !== lang).map(ogLocale);

  return {
    title,
    description: desc, // <meta name="description"> guaranteed
    robots: index ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
    metadataBase: new URL(BASE),
    alternates: { canonical, languages: langs },
    openGraph: {
      type: "website",
      url: canonical,
      siteName,
      title,
      description: desc,
      images: absImages,
      locale: ogLocale(lang),
      alternateLocale: alternateLocales,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
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
  url: string; // canonical for current locale
  price: number | string;
  currency: string;
  availability: string;
  condition: string;
  inLanguage?: string; // e.g. "en" | "ka"
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
    inLanguage,
  } = args;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: ensureMetaDescription(description),
    image: images && images.length ? images : undefined,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    category,
    url,
    inLanguage,
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
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: BASE,
    logo: BASE + siteConfig.logo,
    sameAs: siteConfig.links
      ? Object.values(siteConfig.links).filter((v) => typeof v === "string" && v.startsWith("http"))
      : [],
  };
}

export function buildWebsiteJsonLd() {
  const searchUrl = `${BASE}/${siteConfig.localeDefault}/category?q={search_term_string}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: BASE,
    potentialAction: {
      "@type": "SearchAction",
      target: searchUrl,
      "query-input": "required name=search_term_string",
    },
  };
}
