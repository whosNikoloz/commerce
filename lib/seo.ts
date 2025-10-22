// src/lib/seo.ts
import type { Metadata } from "next";

import { headers } from "next/headers";

import type { SiteConfig, TenantConfig } from "@/types/tenant";
import { locales, type Locale, defaultLocale } from "@/i18n.config";
import { getTenantByHost } from "./getTenantByHost";

/* ---------- site resolvers ---------- */

export async function getSiteByHost(host?: string): Promise<SiteConfig> {
  const key = (host || "").toLowerCase();
  const clean = key.replace(/:.*$/, "").replace(",", ".");
  const tenant = await getTenantByHost(clean);

  return tenant.siteConfig;
}

// Async resolver for server-only usage (reads Host header)
export async function getActiveSite(siteOverride?: SiteConfig): Promise<SiteConfig> {
  if (siteOverride) return siteOverride;
  const h = await headers(); // your project types require await
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";

  return getSiteByHost(host);
}

// Helper to get a default fallback config for situations where we need sync access
// This should be avoided when possible - prefer using getActiveSite()
async function getDefaultSiteConfig(): Promise<SiteConfig> {
  const h = await headers();
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

async function getBASE(siteConfig: SiteConfig): Promise<string> {
  // If site URL is configured, use it
  if (siteConfig.url && siteConfig.url.trim()) {
    return siteConfig.url.replace(/\/$/, "");
  }

  // Otherwise, construct from the current request host
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";

  return `${protocol}://${host}`;
}

/** Prefer passing `siteCfg`; when not provided, requires proper fallback handling. */
export function ensureMetaDescription(siteCfg: SiteConfig, input?: string): string {
  const base = toPlain(input || "") || toPlain(siteCfg.description || "") || " ";

  return clamp(base || " ", 160);
}

export async function toAbsoluteImages(siteCfg: SiteConfig, images?: string[]): Promise<string[]> {
  const BASE = await getBASE(siteCfg);
  const list = (images ?? []).map((src) => (src.startsWith("http") ? src : `${BASE}${src}`));

  return list.length ? list : [BASE + siteCfg.ogImage];
}

export async function buildI18nUrls(path: string, lang: string | Locale, siteCfg: SiteConfig) {
  const BASE = await getBASE(siteCfg);

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

/** @deprecated Use i18nPageMetadataAsync instead - all metadata generation should be async */
export async function i18nPageMetadata({
  title,
  description,
  lang,
  path,
  images,
  siteName,
  index = true,
  alternatesOverride,
  siteOverride,
}: I18nMetaArgs): Promise<Metadata> {
  if (!siteOverride) {
    throw new Error("i18nPageMetadata requires siteOverride - use i18nPageMetadataAsync for dynamic config");
  }

  const desc = ensureMetaDescription(siteOverride, description);
  const absImages = await toAbsoluteImages(siteOverride, images);
  const { canonical, languages, BASE } = await buildI18nUrls(path, lang, siteOverride);
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
      siteName: siteName ?? siteOverride.name,
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
  const desc = ensureMetaDescription(siteCfg, args.description);
  const absImages = await toAbsoluteImages(siteCfg, args.images);
  const { canonical, languages, BASE } = await buildI18nUrls(args.path, args.lang, siteCfg);
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
  siteConfig: SiteConfig; // Required now
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: args.name,
    description: ensureMetaDescription(args.siteConfig, args.description),
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

export async function buildOrganizationJsonLd(siteConfig: SiteConfig) {
  const BASE = await getBASE(siteConfig);

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

export async function buildWebsiteJsonLd(siteConfig: SiteConfig) {
  const BASE = await getBASE(siteConfig);
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
