// src/lib/seo.ts
import type { Metadata } from "next";

import { headers } from "next/headers";

import { SITES, DEFAULT_SITE, type SiteConfig } from "@/config/site";
import { locales, type Locale, defaultLocale } from "@/i18n.config";

/* ---------- site resolvers ---------- */

export function getSiteByHost(host?: string): SiteConfig {
  const key = (host || "").toLowerCase();
  const clean = key.replace(/:.*$/, "").replace(",", ".");

  return SITES[clean] ?? DEFAULT_SITE;
}

// Async resolver for server-only usage (reads Host header)
export async function getActiveSite(siteOverride?: SiteConfig): Promise<SiteConfig> {
  if (siteOverride) return siteOverride;
  const h = await headers(); // your project types require await
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";

  return getSiteByHost(host);
}

/* ---------------- helpers ---------------- */

function ensureLeadingSlash(p: string) {
  return p.startsWith("/") ? p : `/${p}`;
}
const toPlain = (s: string) =>
  s
    ?.replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const clamp = (s: string, max = 160) => (s.length <= max ? s : s.slice(0, max - 1).trim() + "…");

function getBASE(siteConfig: SiteConfig) {
  return siteConfig.url.replace(/\/$/, "");
}

/** Prefer passing `siteCfg`; otherwise this falls back to DEFAULT_SITE. */
export function ensureMetaDescription(input?: string, siteCfg?: SiteConfig): string {
  const site = siteCfg ?? DEFAULT_SITE;
  const base = toPlain(input || "") || toPlain(site.description || "") || " ";

  return clamp(base || " ", 160);
}

export function toAbsoluteImages(images?: string[], siteCfg?: SiteConfig): string[] {
  const site = siteCfg ?? DEFAULT_SITE;
  const BASE = getBASE(site);
  const list = (images ?? []).map((src) => (src.startsWith("http") ? src : `${BASE}${src}`));

  return list.length ? list : [BASE + site.ogImage];
}

export function buildI18nUrls(path: string, lang: string | Locale, siteCfg?: SiteConfig) {
  const site = siteCfg ?? DEFAULT_SITE;
  const BASE = getBASE(site);

  const l = (lang as string) || defaultLocale;
  const clean = ensureLeadingSlash(path);

  const segments = clean.split("/").filter(Boolean);
  const first = segments[0];
  const normalized = locales.includes(first as Locale) ? `/${segments.slice(1).join("/")}` : clean;

  const canonical = `${BASE}/${l}${normalized}`;
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((loc) => [loc, `${BASE}/${loc}${normalized}`]),
  );

  return { canonical, languages, BASE };
}

const ogLocale = (lang: string | Locale) => String(lang).toLowerCase();

/* ---------------- metadata builders ---------------- */

export type I18nMetaArgs = {
  title: string;
  description?: string;
  lang: Locale | string;
  path: string;
  images?: string[];
  siteName?: string;
  index?: boolean;
  alternatesOverride?: Record<string, string>;
  siteOverride?: SiteConfig;
};

/** SYNC: Only safe if you pass siteOverride or accept DEFAULT_SITE fallback. */
export function i18nPageMetadata({
  title,
  description,
  lang,
  path,
  images,
  siteName,
  index = true,
  alternatesOverride,
  siteOverride,
}: I18nMetaArgs): Metadata {
  const siteCfg = siteOverride ?? DEFAULT_SITE;
  const desc = ensureMetaDescription(description, siteCfg);
  const absImages = toAbsoluteImages(images, siteCfg);
  const { canonical, languages, BASE } = buildI18nUrls(path, lang, siteCfg);
  const langs = alternatesOverride ?? languages;
  const alternateLocales = locales.filter((l) => l !== lang).map(ogLocale);

  return {
    title,
    description: desc,
    robots: index ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
    metadataBase: new URL(BASE),
    alternates: { canonical, languages: langs },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: siteName ?? siteCfg.name,
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

/** ASYNC: resolves the active site from request headers when siteOverride is not provided. */
export async function i18nPageMetadataAsync(args: I18nMetaArgs): Promise<Metadata> {
  const siteCfg = await getActiveSite(args.siteOverride);
  const desc = ensureMetaDescription(args.description, siteCfg);
  const absImages = toAbsoluteImages(args.images, siteCfg);
  const { canonical, languages, BASE } = buildI18nUrls(args.path, args.lang, siteCfg);
  const langs = args.alternatesOverride ?? languages;
  const alternateLocales = locales.filter((l) => l !== args.lang).map(ogLocale);

  return {
    title: args.title,
    description: desc,
    robots: args.index
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    metadataBase: new URL(BASE),
    alternates: { canonical, languages: langs },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: args.siteName ?? siteCfg.name,
      title: args.title,
      description: desc,
      images: absImages,
      locale: ogLocale(args.lang),
      alternateLocale: alternateLocales,
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
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
  url: string;
  price: number | string;
  currency: string;
  availability: string;
  condition: string;
  inLanguage?: string;
  siteOverride?: SiteConfig;
}) {
  const siteCfg = args.siteOverride ?? DEFAULT_SITE;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: args.name,
    description: ensureMetaDescription(args.description, siteCfg),
    image: args.images && args.images.length ? args.images : undefined,
    brand: args.brand ? { "@type": "Brand", name: args.brand } : undefined,
    category: args.category,
    url: args.url,
    inLanguage: args.inLanguage,
    offers: {
      "@type": "Offer",
      url: args.url,
      priceCurrency: args.currency,
      price: String(args.price),
      availability: args.availability,
      itemCondition: args.condition,
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

export function buildOrganizationJsonLd(siteOverride?: SiteConfig) {
  const siteCfg = siteOverride ?? DEFAULT_SITE;
  const BASE = getBASE(siteCfg);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteCfg.name,
    url: BASE,
    logo: BASE + siteCfg.logo,
    sameAs: siteCfg.links
      ? Object.values(siteCfg.links).filter((v) => typeof v === "string" && v.startsWith("http"))
      : [],
  };
}

export function buildWebsiteJsonLd(siteOverride?: SiteConfig) {
  const siteCfg = siteOverride ?? DEFAULT_SITE;
  const BASE = getBASE(siteCfg);
  const searchUrl = `${BASE}/${siteCfg.localeDefault}/category?q={search_term_string}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteCfg.name,
    url: BASE,
    potentialAction: {
      "@type": "SearchAction",
      target: searchUrl,
      "query-input": "required name=search_term_string",
    },
  };
}
