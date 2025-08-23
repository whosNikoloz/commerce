import { CategoryCarousel } from "@/components/Home/category-carousel";
import { ComingSoon } from "@/components/Home/coming-soon";
import Hero from "@/components/Home/hero";
import { InStockProducts } from "@/components/Home/in-stock-products";
import { Liquidated } from "@/components/Home/liquidated-products";
import { NewArrivals } from "@/components/Home/new-arrivals";

export default function HomePage() {
  return (
    <div className="min-h-screen  ">
      <main className="space-y-16">
        <section className="relative h-[100vh] px-6">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            preload="auto"
          >
            <source src="/Nike.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black bg-opacity-60" />

          <div className="relative z-10 flex items-center justify-center h-full">
            <Hero lng="ka" />
          </div>
        </section>

        <section className="px-4" id="shop-by-category">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold dark:text-text-lightdark text-text-light mb-2">
              Shop by Category
            </h2>
            <p className="font-sans dark:text-text-subtledark text-text-subtle">
              Find exactly what you&apos;re looking for
            </p>
          </div>
          <CategoryCarousel />
        </section>

        <NewArrivals />

        <ComingSoon />

        <Liquidated />

        <InStockProducts />
      </main>
    </div>
  );
}
