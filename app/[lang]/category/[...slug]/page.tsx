import EcommerceCategory from "@/components/Categories/ecommerce-category";
import { title } from "@/components/primitives";

interface CategoryPageProps {
  params: {
    slug?: string[];
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug = [] } = await params; 

  const category = slug[0] || "Unknown Category";
  const subcategory = slug[1] || null;

  return (
    <div>
      {/* <h1 className={title()}>
        {subcategory ? `${category} / ${subcategory}` : category}
      </h1>
      <pre>{JSON.stringify(slug, null, 2)}</pre> */}
      <EcommerceCategory />
    </div>
  );
}
 