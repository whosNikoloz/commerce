import { title } from "@/components/primitives";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  return (
    <div>
      <h1 className={title()}>{category}</h1>
    </div>
  );
}
