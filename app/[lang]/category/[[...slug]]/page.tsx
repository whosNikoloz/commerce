import Script from "next/script";
import { basePageMetadata, buildBreadcrumbJsonLd, buildItemListJsonLd, toAbsoluteImages } from "@/lib/seo";
import { site as siteConfig } from "@/config/site";
import SearchPage from "@/components/Categories/SearchPage/search-page";
import CategoryPage from "@/components/Categories/CategoriesPage/category-page";
import { getProductsByCategory } from "@/app/api/services/productService";
import { getCategoryById } from "@/app/api/services/categoryService";
import { Metadata } from "next";

type Params = { lang: string; slug?: string[] };
type Search = { q?: string };

interface PageProps {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}


export async function generateMetadata(
  { params, searchParams }: { params: Promise<Params>; searchParams: Promise<Search> }
): Promise<Metadata> {
  const { lang, slug = [] } = await params;
  const { q = "" } = await searchParams;

  const categoryId = slug[0];
  const query = q.trim();

  let title = "Category";
  let description = "Browse categories";
  let images: string[] | undefined;

  if (categoryId) {
    const category = await getCategoryById(categoryId).catch(() => null);
    if (category) {
      title = query ? `${category.name} — Search: "${query}"` : (category.name ?? "Category");
      description =
        query
          ? `Products in ${category.name} matching "${query}".`
          : category.description ?? `Shop ${category.name} products.`;
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

  return basePageMetadata({
    title,
    description,
    url,
    images,
    siteName: siteConfig.name,
  });
}


export default async function CategoryIndex({ params, searchParams }: PageProps) {
  const { lang, slug = [] } = await params;
  const { q = "" } = await searchParams;

  const categoryId = slug[0] ?? null;
  const query = q.trim();

  const page = query && !categoryId
    ? <SearchPage query={query} />
    : categoryId
      ? <CategoryPage categoryId={categoryId} />
      : <SearchPage query="" />;

  let listJsonLd: any | undefined;
  let crumbsJsonLd: any | undefined;

  const base = siteConfig.url.replace(/\/$/, "");
  const currentUrl = `${base}/${lang}/category/${slug.join("/")}${query ? `?q=${encodeURIComponent(query)}` : ""}`;

  const crumbs: Array<{ name: string; url: string }> = [
    { name: "Home", url: `${base}/${lang}` },
    { name: "Catalog", url: `${base}/${lang}/category` },
  ];
  if (categoryId) {
    crumbs.push({ name: "Category", url: currentUrl });
  } else if (query) {
    crumbs.push({ name: `Search: ${query}`, url: currentUrl });
  }
  crumbsJsonLd = buildBreadcrumbJsonLd(crumbs);

  try {
    const products = await getProductsByCategory(categoryId);
    const mapped = (products ?? []).map((p: any) => ({
      name: p.name,
      url: `${base}/${lang}/product/${p.id}`,
      image: toAbsoluteImages([typeof p.image === "string" ? p.image : p?.images?.[0]])[0],
    }));
    if (mapped.length) listJsonLd = buildItemListJsonLd(mapped);
  } catch { }

  return (
    <>
      {crumbsJsonLd && (
        <Script id="ld-breadcrumbs" type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbsJsonLd) }} />
      )}
      {listJsonLd && (
        <Script id="ld-itemlist" type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
      )}
      {page}
    </>
  );
}
