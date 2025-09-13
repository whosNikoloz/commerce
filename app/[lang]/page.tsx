import { BrandPartners } from "@/components/Home/brand-partners";
import { CategoryGrid } from "@/components/Home/category-grid";
import { ComingSoonSection } from "@/components/Home/coming-soon-section";
import { InStockSection } from "@/components/Home/in-stock-section";
import { LiquidationSection } from "@/components/Home/liquidation-section";
import { ModernHero } from "@/components/Home/modern-hero";
import { NewsletterSignup } from "@/components/Home/newsletter-signup";
import { PopularProducts } from "@/components/Home/popular-products";
import { ProductCarousel } from "@/components/Home/product-carousel";
import { StatsShowcase } from "@/components/Home/stats-showcase";
import { VideoShowcase } from "@/components/Home/video-showcase";

export default function HomePage() {
  return (
    <main className="min-h-screen mt-20 md:mt-0">
      <ModernHero />
      <PopularProducts />
      <CategoryGrid />
      <BrandPartners />
      <ProductCarousel />
      <InStockSection />
      <LiquidationSection />
      <VideoShowcase />
      <ComingSoonSection />
      <StatsShowcase />
      <NewsletterSignup />
    </main>
  );
}
