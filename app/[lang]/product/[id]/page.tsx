import type { Metadata } from "next";

import { notFound } from "next/navigation";
import Script from "next/script";

import { getProductById } from "@/app/api/services/productService";
import {
  i18nPageMetadataAsync, // ← async, host-aware
  buildProductJsonLd,
  toAbsoluteImages,
  buildI18nUrls,
  getActiveSite, // ← resolve current site from headers
} from "@/lib/seo";
import ProductDetail from "@/components/Product/product-detail";

// Use ISR with revalidation for better performance
export const revalidate = 60; // Revalidate every 60 seconds

type DetailPageParams = { lang: string; id: string };
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
  const { lang, id } = await params;
  const site = await getActiveSite(); // per-host
  const product = await getProductById(id).catch(() => null);

  const path = `/product/${id}`;

  if (!product) {
    return i18nPageMetadataAsync({
      title: "Product not found",
      description: `The product ${id} could not be found or was removed.`,
      lang,
      path,
      images: [site.ogImage],
      index: false,
    });
  }

  const title = product?.name ?? "Product";
  // Create a meaningful meta description
  const description = product?.description
    ? product.description.length > 160
      ? product.description.slice(0, 157) + "..."
      : product.description
    : `${product?.name ?? "Product"} - ${product.brand?.name ? `by ${product.brand.name}` : ""}${product.category?.name ? ` in ${product.category.name}` : ""}. ${product.price ? `Price: ₾${product.price}` : ""} Shop now at ${site.name}.`.trim();
  const images = await toAbsoluteImages(site, normalizeImages(product?.images, site.ogImage));

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
  const { lang, id } = await params;
  const site = await getActiveSite(); // per-host
  const product = await getProductById(id).catch(() => null);

  if (!product) return notFound();

  const path = `/product/${id}`;
  const { canonical } = await buildI18nUrls(path, lang, site); // canonical for current locale

  const images = await toAbsoluteImages(site, normalizeImages(product.images, site.ogImage));
  const price = product.discountPrice ?? product.price ?? 0;

  const availability =
    product.status === 1 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
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
