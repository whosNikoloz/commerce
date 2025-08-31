import type { Metadata } from "next";

import { notFound } from "next/navigation";
import Script from "next/script";

import { getProductById } from "@/app/api/services/productService";
import {
  i18nPageMetadata, // ⬅️ new
  buildProductJsonLd,
  toAbsoluteImages,
  buildI18nUrls, // ⬅️ new
} from "@/lib/seo";
import { site as siteConfig } from "@/config/site";
import ProductDetail from "@/components/Product/product-detail";

export const dynamic = "force-dynamic";

type DetailPageParams = { lang: string; id: string };
type DetailPageProps = { params: Promise<DetailPageParams> };

function normalizeImages(imgs: unknown): string[] {
  const raw = Array.isArray(imgs) ? imgs : [];
  const list = raw
    .map((i) => (typeof i === "string" ? i : (i as any)?.url))
    .filter((s): s is string => !!s);

  return list.length ? list : [siteConfig.ogImage];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<DetailPageParams>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const product = await getProductById(id).catch(() => null);

  const path = `/product/${id}`;

  if (!product) {
    return i18nPageMetadata({
      title: "Product not found",
      description: `The product ${id} could not be found or was removed.`,
      lang,
      path,
      images: [siteConfig.ogImage],
      siteName: siteConfig.name,
      index: false,
    });
  }

  const title = product?.name ?? "Product";
  const description = product?.description ?? siteConfig.description;
  const images = toAbsoluteImages(normalizeImages(product?.images));

  return i18nPageMetadata({
    title,
    description,
    lang,
    path,
    images,
    siteName: siteConfig.name,
    index: true,
  });
}

export default async function ProductPage({ params }: DetailPageProps) {
  const { lang, id } = await params;
  const product = await getProductById(id).catch(() => null);

  if (!product) return notFound();

  const path = `/product/${id}`;
  const { canonical } = buildI18nUrls(path, lang); // canonical for current locale

  const images = toAbsoluteImages(normalizeImages(product.images));
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
    url: canonical, // ⬅️ use i18n canonical
    price,
    currency: siteConfig.currency ?? "GEL",
    availability,
    condition: itemCondition,
    inLanguage: lang, // ⬅️ optional but nice
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
