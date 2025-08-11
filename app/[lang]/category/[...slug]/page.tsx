import CategoryPage from "@/components/Categories/CategoriesPage/category-page";
import { title } from "@/components/primitives";

interface CategoryPageProps {
  params: {
    slug?: string[];
  };
}

export default async function CategoryPageRoute({ params }: CategoryPageProps) {
  const { slug = [] } = await params;

  const category = slug[0] || "Unknown Category";
  const subcategory = slug.length > 1 ? slug[slug.length - 1] : null;

  return (
    <div>
      {/* <h1 className={title()}>
        {subcategory ? `${category} / ${subcategory}` : category}
      </h1> */}
      <CategoryPage categoryId={subcategory ? subcategory : category} />
    </div>
  );
}
