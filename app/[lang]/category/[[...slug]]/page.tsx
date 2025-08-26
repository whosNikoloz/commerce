// app/[lang]/category/[...slug]/page.tsx
import type { Metadata } from "next";
import type { FilterModel } from "@/types/filter";
import type { Condition, StockStatus } from "@/types/enums";

import Script from "next/script";
import { notFound } from "next/navigation";

import {
  basePageMetadata,
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  toAbsoluteImages,
} from "@/lib/seo";
import { site as siteConfig } from "@/config/site";
import SearchPage from "@/components/Categories/SearchPage/search-page";
import CategoryPage from "@/components/Categories/CategoriesPage/category-page";
import {
  getCategoryById,
  getCategoryWithSubCategoriesById,
} from "@/app/api/services/categoryService";
import { getAllBrands } from "@/app/api/services/brandService";
import { searchProductsByFilter } from "@/app/api/services/productService";

export const revalidate = 300; // 5 minutes

type Params = { lang: string; slug?: string[] };
type Search = {
  q?: string;
  page?: string;
  sort?: string;
  min?: string;
  max?: string;
  brand?: string | string[];
  cond?: string | string[];
  stock?: string;
  facet?: string | string[];
};

function buildFilter(
  categoryId: string,
  sp: Search,
): {
  filter: FilterModel;
  page: number;
  sortBy: string;
} {
  const page = Math.max(1, Number(sp.page ?? 1));
  const sortBy = (sp.sort as string) || "featured";

  const brandIds = Array.isArray(sp.brand) ? sp.brand : sp.brand ? [sp.brand] : [];

  const conditions = Array.isArray(sp.cond)
    ? (sp.cond.map(Number).filter(Number.isFinite) as Condition[])
    : sp.cond
      ? ([Number(sp.cond)] as Condition[])
      : [];

  const stockStatus =
    sp.stock === undefined ? undefined : (Number(sp.stock) as StockStatus | undefined);

  const minPrice = sp.min ? Number(sp.min) : undefined;
  const maxPrice = sp.max ? Number(sp.max) : undefined;

  const facetValueIds = Array.isArray(sp.facet) ? sp.facet : sp.facet ? [sp.facet] : [];

  return {
    filter: {
      brandIds,
      categoryIds: [categoryId],
      condition: conditions,
      stockStatus,
      minPrice: Number.isFinite(minPrice!) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice!) ? maxPrice : undefined,
      facetFilters: facetValueIds.map((id) => ({ facetValueId: id })),
    },
    page,
    sortBy,
  };
}

// ========== Metadata ==========
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const { lang, slug = [] } = await params;
  const sp = await searchParams;

  const categoryId = slug[0];
  const query = (sp.q ?? "").trim();

  let title = "Category";
  let description = "Browse categories";
  let images: string[] | undefined;

  if (categoryId) {
    const category = await getCategoryById(categoryId).catch(() => null);

    if (category) {
      title = query ? `${category.name} — Search: "${query}"` : (category.name ?? "Category");
      description = query
        ? `Products in ${category.name} matching "${query}".`
        : (category.description ?? `Shop ${category.name} products.`);
      //if (category.image) images = toAbsoluteImages([category.image]);
    } else {
      title = "Category not found";
      description = `The category ${categoryId} could not be found or was removed.`;
    }
  } else if (query) {
    title = `Search results for "${query}"`;
    description = `Browse products matching "${query}".`;
  }

  const base = siteConfig.url.replace(/\/$/, "");
  const path = categoryId ? `/category/${slug.join("/")}` : "/category";
  const url = `${base}/${lang}${path}${query ? `?q=${encodeURIComponent(query)}` : ""}`;

  const meta = basePageMetadata({
    title,
    description,
    url,
    images,
    siteName: siteConfig.name,
  });

  return {
    ...meta,
    alternates: { canonical: url },
    robots: { index: title !== "Category not found", follow: true },
    openGraph: { ...meta.openGraph, url, siteName: siteConfig.name },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.[0],
    },
  };
}

// ========== Page ==========
export default async function CategoryIndex({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { lang, slug = [] } = await params;
  const sp = await searchParams;

  const base = siteConfig.url.replace(/\/$/, "");
  const q = (sp.q ?? "").trim();
  const categoryId = slug[0] ?? null;

  // Search-only landing
  if (!categoryId) {
    const crumbsJsonLd = buildBreadcrumbJsonLd([
      { name: "Home", url: `${base}/${lang}` },
      { name: "Catalog", url: `${base}/${lang}/category` },
      { name: q ? `Search: ${q}` : "Search", url: `${base}/${lang}/category` },
    ]);

    return (
      <>
        <Script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbsJsonLd) }}
          id="ld-breadcrumbs"
          type="application/ld+json"
        />
        <SearchPage query={q} />
      </>
    );
  }

  // Fetch category tree + brands server-side (for HTML-first render)
  const [rawTree, brands] = await Promise.all([
    getCategoryWithSubCategoriesById(categoryId).catch(() => null),
    getAllBrands(),
  ]);

  // Normalize to parent with subcategories
  let parent: any | null = null;

  if (rawTree) {
    if (Array.isArray(rawTree)) {
      const root =
        rawTree.find((c) => c.id === categoryId) ?? rawTree.find((c) => c.parentId == null) ?? null;

      parent = root
        ? { ...root, subcategories: rawTree.filter((c) => c.parentId === root.id) }
        : null;
    } else {
      parent = rawTree;
    }
  }

  if (!parent) {
    notFound();
  }

  // Server-render first page of products (SEO + speed)
  const { filter, page, sortBy } = buildFilter(parent.id, sp);
  const pageSize = 12;

  const initial = await searchProductsByFilter({
    filter,
    page,
    pageSize,
    sortBy,
  }).catch(() => ({ items: [], totalCount: 0 }));

  // JSON-LD
  const currentUrl = `${base}/${lang}/category/${slug.join("/")}`;
  const crumbsJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: `${base}/${lang}` },
    { name: "Catalog", url: `${base}/${lang}/category` },
    { name: parent.name ?? "Category", url: currentUrl },
  ]);

  const listJsonLd =
    (initial.items?.length ?? 0) > 0
      ? buildItemListJsonLd(
          (initial.items ?? []).map((p: any) => ({
            name: p.name,
            url: `${base}/${lang}/product/${p.id}`,
            image: toAbsoluteImages([typeof p.image === "string" ? p.image : p?.images?.[0]])[0],
          })),
        )
      : undefined;

  return (
    <>
      <Script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbsJsonLd) }}
        id="ld-breadcrumbs"
        type="application/ld+json"
      />
      {listJsonLd && (
        <Script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }}
          id="ld-itemlist"
          type="application/ld+json"
        />
      )}

      {/* Hydrate your existing client CategoryPage with initial server data */}
      <CategoryPage
        __initialBrands={brands}
        __initialCategory={parent}
        __initialPage={page}
        __initialProducts={initial.items ?? []}
        __initialSort={sortBy}
        __initialTotal={initial.totalCount ?? 0}
        categoryId={parent.id}
      />
    </>
  );
}
