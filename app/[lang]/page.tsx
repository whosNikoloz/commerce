import FixedCardCarousel from "@/components/Categories/fixed-carousel";
import ProductList from "@/components/productList";

export default function HomePage() {
  return (
    <div className="py-16">
      <FixedCardCarousel />
      <ProductList />
      <ProductList />
      <ProductList />
      <ProductList />
      <ProductList />
    </div>
  );
}
