import FixedCardCarousel from "@/components/Categories/fixed-carousel";
import Hero from "@/components/Home/hero";
import ProductList from "@/components/productList";

export default function HomePage() {
  return (
    <main className="relative">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-[100vh] object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/Nike.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <section className="relative z-10 flex items-center justify-center h-[100vh] px-6">
        <Hero lng="ka" />
      </section>

      <section className="mx-auto items-center justify-center">
        <div className="mb-10 mx-auto">
          <FixedCardCarousel />
        </div>
      </section>


      <section className="relative z-10 bg-gray-50 pt-10 pb-20">
        <div className="container mx-auto px-4">
          <ProductList />
        </div>
      </section>
    </main>
  );
}
