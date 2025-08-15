import { getProductById } from "@/app/api/services/productService";
import ProductDetail from "@/components/Product/product-detail";
import { ProductResponseModel } from "@/types/product";

type DetailPageParams = { lang: string; id: string };
type DetailPageProps = { params: Promise<DetailPageParams> };

export default async function ProductPage({ params }: DetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  const categoryId = product.category?.id ?? "";
  // const similar = categoryId
  //   ? await getSimilarByCategory(categoryId, product.id)
  //   : [];

  const similar: ProductResponseModel[] = [];

  return (
    <>
      {/* <h1 className={title()}>{id}</h1> */}
      <ProductDetail initialProduct={product}
        initialSimilar={similar} />
    </>
  );
}
