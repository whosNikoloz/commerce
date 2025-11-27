import type { Metadata } from "next";
import type { FilterModel } from "@/types/filter";
import type { Condition, StockStatus } from "@/types/enums";
import type { Locale } from "@/i18n.config";
import type { FacetModel } from "@/types/facet";

import Script from "next/script";
import { notFound } from "next/navigation";

import {
  i18nPageMetadataAsync,
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  toAbsoluteImages,
  buildI18nUrls,
  getActiveSite,
} from "@/lib/seo";
import SearchPage from "@/components/Categories/SearchPage/search-page";
import CategoryPage from "@/components/Categories/CategoriesPage/category-page";
import {
  getCategoryById,
  getCategoryWithSubCategoriesById,
} from "@/app/api/services/categoryService";
import { getAllBrands } from "@/app/api/services/brandService";
import { searchProductsByFilter } from "@/app/api/services/productService";
import { buildFacetValueToFacetIdMap } from "@/lib/urlState";
import { getDictionary } from "@/lib/dictionaries";

export const revalidate = 300; // 5 minutes

type Params = { lang: Locale; slug?: string[] };
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
  facets: FacetModel[] = [],
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

  const facetValueToFacetId = buildFacetValueToFacetIdMap(facets);

  return {
    filter: {
      brandIds,
      categoryIds: [categoryId],
      condition: conditions,
      stockStatus,
      minPrice: Number.isFinite(minPrice!) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice!) ? maxPrice : undefined,
      facetFilters: facetValueIds
        .map((facetValueId) => {
          const facetId = facetValueToFacetId[facetValueId];

          return facetId ? { facetId, facetValueId } : null;
        })
        .filter((f): f is { facetId: string; facetValueId: string } => f !== null),
    },
    page,
    sortBy,
  };
}

/* ========== Metadata (i18n-aware, per-host) ========== */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { lang, slug = [] } = resolvedParams;
  const sp = await searchParams;
  const dict = await getDictionary(lang);
  const t = dict.category; // ← შენს dictionary-ში category სექცია უნდა გქონდეს

  const categoryId = slug[0];
  const query = (sp.q ?? "").trim();

  let title = t.meta?.defaultTitle ?? "Category";
  let description = t.meta?.defaultDescription ?? "Browse categories.";
  let images: string[] | undefined;
  let index = true;

  const site = await getActiveSite();

  if (categoryId) {
    const category = await getCategoryById(categoryId).catch(() => null);

    if (category) {
      if (query) {
        // Search inside category
        title =
          t.search?.inCategoryTitle
            ?.replace("{{category}}", category.name ?? "")
            .replace("{{query}}", query) ??
          `${category.name} — ${query}`;

        description =
          t.search?.inCategoryDescription
            ?.replace("{{category}}", category.name ?? "")
            .replace("{{query}}", query) ??
          `Products in ${category.name} matching "${query}".`;
      } else {
        // Pure category page
        title = category.name ?? t.meta?.defaultTitle ?? "Category";
        description =
          category.description ??
          t.meta?.categoryDescription?.replace("{{category}}", category.name ?? "") ??
          `Shop ${category.name} products.`;
      }

      // Try to get the first product image for better social sharing
      const facets = ((category as any)?.facets as FacetModel[]) ?? [];
      const { filter } = buildFilter(categoryId, sp, facets);
      const firstProduct = await searchProductsByFilter({
        filter,
        page: 1,
        pageSize: 1,
        sortBy: "featured",
      }).catch(() => ({ items: [] }));

      if (firstProduct?.items?.[0]) {
        const p = firstProduct.items[0] as any;
        const productImage =
          Array.isArray(p.images) && p.images.length > 0
            ? p.images[0]
            : typeof p.image === "string"
              ? p.image
              : null;

        if (productImage) {
          images = [productImage];
        }
      }

      if (!images && (category as any)?.image) {
        images = [(category as any).image as string];
      }

      if (!images) {
        images = [site.ogImage && site.ogImage.trim() ? site.ogImage : site.logo];
      }

      index = !query; // don't index search views
    } else {
      title = t.meta?.notFoundTitle ?? "Category not found";
      description =
        t.meta?.notFoundDescription ??
        `The category ${categoryId} could not be found or was removed.`;
      index = false;
    }
  } else if (query) {
    // Search-only (no category)
    title =
      t.search?.title?.replace("{{query}}", query) ??
      `Search: ${query}`;
    description =
      t.search?.description?.replace("{{query}}", query) ??
      `Browse products matching "${query}".`;
    index = false;
  }

  if (!images) {
    images = [site.ogImage && site.ogImage.trim() ? site.ogImage : site.logo];
  }

  const path = categoryId ? `/category/${slug.join("/")}` : "/category";

  return i18nPageMetadataAsync({
    title,
    description,
    lang,
    path,
    images,
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
  const resolvedParams = await params;
  const { lang, slug = [] } = resolvedParams;
  const sp = await searchParams;
  const dict = await getDictionary(lang);
  const t = dict.category;

  const q = (sp.q ?? "").trim();
  const categoryId = slug[0] ?? null;

  const site = await getActiveSite();

  // --- Search-only landing (no category) ---
  if (!categoryId) {
    const { canonical: home } = await buildI18nUrls("/", lang, site);
    const { canonical: catalog } = await buildI18nUrls("/category", lang, site);

    const crumbsJsonLd = buildBreadcrumbJsonLd([
      { name: t.breadcrumbs?.home ?? "Home", url: home },
      { name: t.breadcrumbs?.catalog ?? "Catalog", url: catalog },
      {
        name: q
          ? (t.breadcrumbs?.searchWithQuery ?? "Search").replace("{{query}}", q)
          : t.breadcrumbs?.search ?? "Search",
        url: catalog,
      },
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

  let parent: any | null = null;

  if (rawTree) {
    if (Array.isArray(rawTree)) {
      const root =
        rawTree.find((c) => c.id === categoryId) ??
        rawTree.find((c) => c.parentId == null) ??
        null;

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

  const facets = (parent.facets as FacetModel[]) ?? [];
  const { filter, page, sortBy } = buildFilter(parent.id, sp, facets);
  const pageSize = 12;

  const initial = await searchProductsByFilter({
    filter,
    page,
    pageSize,
    sortBy,
  }).catch(() => ({ items: [], totalCount: 0 }));

  const { canonical: home } = await buildI18nUrls("/", lang, site);
  const { canonical: catalog } = await buildI18nUrls("/category", lang, site);
  const { canonical: current } = await buildI18nUrls(`/category/${slug.join("/")}`, lang, site);

  const crumbsJsonLd = buildBreadcrumbJsonLd([
    { name: t.breadcrumbs?.home ?? "Home", url: home },
    { name: t.breadcrumbs?.catalog ?? "Catalog", url: catalog },
    { name: parent.name ?? (t.meta?.defaultTitle ?? "Category"), url: current },
  ]);

  const listJsonLd =
    (initial.items?.length ?? 0) > 0
      ? buildItemListJsonLd(
        await Promise.all(
          (initial.items ?? []).map(async (p: any) => {
            const img =
              typeof p.image === "string"
                ? p.image
                : Array.isArray(p.images) && p.images.length > 0
                  ? p.images[0]
                  : site.ogImage;

            const { canonical: url } = await buildI18nUrls(`/product/${p.id}`, lang, site);
            const absoluteImages = await toAbsoluteImages(site, [img]);

            return {
              name: p.name,
              url,
              image: absoluteImages[0],
            };
          }),
        ),
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
