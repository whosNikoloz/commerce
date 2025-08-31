import type { Metadata } from "next";
import type { FilterModel } from "@/types/filter";
import type { Condition, StockStatus } from "@/types/enums";

import Script from "next/script";
import { notFound } from "next/navigation";

import {
  i18nPageMetadata,
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  toAbsoluteImages,
  buildI18nUrls,
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

/* ========== Metadata (i18n-aware) ========== */
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
  let index = true;

  if (categoryId) {
    const category = await getCategoryById(categoryId).catch(() => null);

    if (category) {
      title = query ? `${category.name} — Search: "${query}"` : (category.name ?? "Category");
      description = query
        ? `Products in ${category.name} matching "${query}".`
        : (category.description ?? `Shop ${category.name} products.`);
      if ((category as any)?.image) images = [(category as any).image as string];
      // index category pages normally; but avoid indexing if it's a search view
      index = !query;
    } else {
      title = "Category not found";
      description = `The category ${categoryId} could not be found or was removed.`;
      index = false;
    }
  } else if (query) {
    //title = `Search results for "${query}"`;
    title = query;
    description = `Browse products matching "${query}".`;
    // generally better to noindex pure search pages
    index = false;
  }

  const path = categoryId ? `/category/${slug.join("/")}` : "/category";

  return i18nPageMetadata({
    title,
    description,
    lang,
    path, // canonical/alternates built from this path (no query)
    images, // i18nPageMetadata will absolutize
    siteName: siteConfig.name,
    index,
  });
}

/* ========== Page ========== */
export default async function CategoryIndex({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { lang, slug = [] } = await params;
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const categoryId = slug[0] ?? null;

  // --- Search-only landing (no category) ---
  if (!categoryId) {
    const home = buildI18nUrls("/", lang).canonical;
    const catalog = buildI18nUrls("/category", lang).canonical;

    const crumbsJsonLd = buildBreadcrumbJsonLd([
      { name: "Home", url: home },
      { name: "Catalog", url: catalog },
      { name: q ? `Search: ${q}` : "Search", url: catalog },
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

  // JSON-LD (localized URLs)
  const home = buildI18nUrls("/", lang).canonical;
  const catalog = buildI18nUrls("/category", lang).canonical;
  const current = buildI18nUrls(`/category/${slug.join("/")}`, lang).canonical;

  const crumbsJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: home },
    { name: "Catalog", url: catalog },
    { name: parent.name ?? "Category", url: current },
  ]);

  const listJsonLd =
    (initial.items?.length ?? 0) > 0
      ? buildItemListJsonLd(
          (initial.items ?? []).map((p: any) => {
            const img =
              typeof p.image === "string"
                ? p.image
                : Array.isArray(p.images) && p.images.length > 0
                  ? p.images[0]
                  : siteConfig.ogImage;

            return {
              name: p.name,
              url: buildI18nUrls(`/product/${p.id}`, lang).canonical,
              image: toAbsoluteImages([img])[0],
            };
          }),
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
