import type { Metadata } from "next";
import type { Locale } from "@/i18n.config";

import { notFound } from "next/navigation";
import Script from "next/script";

import { getProductById } from "@/app/api/services/productService";
import {
  i18nPageMetadataAsync, // async, host-aware
  buildProductJsonLd,
  toAbsoluteImages,
  buildI18nUrls,
  getActiveSite, // resolve current site from headers
} from "@/lib/seo";
import ProductDetail from "@/components/Product/product-detail";
import { getDictionary } from "@/lib/dictionaries";

// Use ISR with revalidation for better performance
export const revalidate = 60; // Revalidate every 60 seconds

type DetailPageParams = { lang: Locale; id: string };
type DetailPageProps = { params: Promise<DetailPageParams> };

function normalizeImages(imgs: unknown, fallbackOg: string): string[] {
  const raw = Array.isArray(imgs) ? imgs : [];
  const list = raw
    .map((i) => (typeof i === "string" ? i : (i as any)?.url))
    .filter((s): s is string => !!s);

  return list.length ? list : [fallbackOg];
}

/* ========== Metadata ========== */
export async function generateMetadata({
  params,
}: {
  params: Promise<DetailPageParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { lang, id } = resolvedParams;
  const site = await getActiveSite(); // per-host
  const product = await getProductById(id).catch(() => null);
  const dict = await getDictionary(lang);

  const path = `/product/${id}`;

  // 404 / not found metadata — translated
  if (!product) {
    const notFoundTitle =
      dict.product?.notFound?.title || "Product not found";
    const notFoundDescription =
      dict.product?.notFound?.description ||
      `The product ${id} could not be found or was removed.`;

    return i18nPageMetadataAsync({
      title: notFoundTitle,
      description: notFoundDescription,
      lang,
      path,
      images: [site.ogImage || site.logo],
      index: false,
    });
  }

  // Normal product metadata
  const title = product.name ?? "Product";

  // Create a meaningful meta description
  const description = product.description
    ? product.description.length > 160
      ? product.description.slice(0, 157) + "..."
      : product.description
    : `${product.name ?? "Product"}${product.brand?.name ? ` · ${product.brand.name}` : ""
      }${product.category?.name ? ` · ${product.category.name}` : ""
      }${product.price ? ` · Price: ₾${product.price}` : ""
      } · ${site.name}`.trim();

  const images = await toAbsoluteImages(
    site,
    normalizeImages(product.images, site.ogImage || site.logo),
  );

  return i18nPageMetadataAsync({
    title,
    description,
    lang,
    path,
    images,
    index: true,
  });
}

/* ========== Page ========== */
export default async function ProductPage({ params }: DetailPageProps) {
  const resolvedParams = await params;
  const { lang, id } = resolvedParams;
  const site = await getActiveSite(); // per-host
  const product = await getProductById(id).catch(() => null);

  if (!product) return notFound();

  const path = `/product/${id}`;
  const { canonical } = await buildI18nUrls(path, lang, site); // canonical for current locale

  const images = await toAbsoluteImages(
    site,
    normalizeImages(product.images, site.ogImage || site.logo),
  );
  const price = product.discountPrice ?? product.price ?? 0;

  const availability =
    product.status === 1
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const itemCondition =
    product.condition === 0
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition";

  const jsonLd = buildProductJsonLd({
    name: product.name ?? "Product",
    description: product.description ?? "",
    images,
    brand: product.brand?.name,
    category: product.category?.name,
    url: canonical,
    price,
    currency: site.currency ?? "GEL",
    availability,
    condition: itemCondition,
    inLanguage: lang,
    siteConfig: site, // required for dynamic tenant config
  });

  return (
    <>
      <Script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        id="ld-product"
        type="application/ld+json"
      />
      <ProductDetail initialProduct={product} initialSimilar={[]} />
    </>
  );
}
