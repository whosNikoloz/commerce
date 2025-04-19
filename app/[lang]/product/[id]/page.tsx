import ProductDetail from "@/components/Product/product-detail";

interface DetailPageProps {
  params: {
    id: string;
  };
}

export default async function CategoryPage({ params }: DetailPageProps) {
  const { id } = await params;

  return (
    <div>
      {/* <h1 className={title()}>{id}</h1> */}
      <ProductDetail />
    </div>
  );
}
