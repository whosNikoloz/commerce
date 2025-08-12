import CategoryPage from "@/components/Categories/CategoriesPage/category-page";

interface CategoryPageProps {
  params: {
    slug?: string[];
  };
}

export default async function SearchPage({ params }: CategoryPageProps) {
  const { slug = [] } = await params;

  const category = slug[0] || "Unknown Category";
  const subcategory = slug.length > 1 ? slug[slug.length - 1] : null;

  return (
    <div>
      <CategoryPage categoryId={subcategory ? subcategory : category} />
    </div>
  );
}
