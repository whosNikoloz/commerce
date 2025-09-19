import type { Metadata } from "next";
import { i18nPageMetadataAsync, getActiveSite } from "@/lib/seo";
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
import { Locale } from "@/i18n.config";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const site = await getActiveSite();

  return i18nPageMetadataAsync({
    title: site.name ?? "Home",
    description:
      site.description ??
      "Premium products, fast delivery, secure checkout. Discover what’s new, in stock, and on sale.",
    lang,
    path: "/",
    images: [site.ogImage],
    index: true,
  });
}

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
