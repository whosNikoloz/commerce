import CategoryPage from "@/components/Categories/CategoriesPage/category-page";
import SearchPage from "@/components/Categories/SearchPage/search-page";

interface PageProps {
  params: { lang: string; slug?: string[] };
  searchParams: { q?: string };
}

export default async function CategoryIndex({ params, searchParams }: PageProps) {
  const { slug = [] } = await params;
  const { q = "" } = await searchParams;

  const categoryId = slug[0] ?? null;
  const query = q.trim();

  if (query && !categoryId) return <SearchPage query={query} />;
  if (categoryId) return <CategoryPage categoryId={categoryId} />;

  return <SearchPage query="" />;
}
