import type { Metadata } from "next";

import { notFound } from "next/navigation";
import Script from "next/script";

import { getProductById } from "@/app/api/services/productService";
import { basePageMetadata, buildProductJsonLd, toAbsoluteImages } from "@/lib/seo";
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

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { lang, id } = await params;
  const product = await getProductById(id).catch(() => null);

  const base = siteConfig.url.replace(/\/$/, "");
  const url = `${base}/${lang}/product/${id}`;

  if (!product) {
    const title = "Product not found";
    const description = `The product ${id} could not be found or was removed.`;

    return {
      title,
      description,
      robots: { index: false, follow: false },
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        url,
        siteName: siteConfig.name,
        title,
        description,
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const title = product?.name ?? "Product";
  const description = product?.description ?? siteConfig.description;
  const images = toAbsoluteImages(normalizeImages(product?.images));

  return basePageMetadata({
    title,
    description,
    url,
    images,
    siteName: siteConfig.name,
  });
}

export default async function ProductPage({ params }: DetailPageProps) {
  const { lang, id } = await params;
  const product = await getProductById(id).catch(() => null);

  if (!product) return notFound();

  const base = siteConfig.url.replace(/\/$/, "");
  const url = `${base}/${lang}/product/${id}`;
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
    url,
    price,
    currency: siteConfig.currency ?? "GEL",
    availability,
    condition: itemCondition,
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
