import type { ProductRailData, Locale } from "@/types/tenant";
import type { FilterModel } from "@/types/filter";
import type { Condition, StockStatus } from "@/types/enums";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { SectionContainer } from "./SectionContainer";

import { Button } from "@/components/ui/button";
import { searchProductsByFilter } from "@/app/api/services/productService";
import { t, tOpt } from "@/lib/i18n";
import CarouselRail from "@/components/rails/CarouselRail";


interface ProductRailProps {
  data: ProductRailData;
  locale: Locale;
  template?: 1 | 2;
  className?: string;
}

export default async function ProductRail({
  data,
  locale,
  template = 1,
  className,
}: ProductRailProps) {
  let products: any[] | null = null;
  let error: Error | null = null;

  try {
    const filter: FilterModel = {};

    if (data.filterBy?.categoryIds?.length) filter.categoryIds = data.filterBy.categoryIds;
    if (data.filterBy?.brandIds?.length) filter.brandIds = data.filterBy.brandIds;
    if (data.filterBy?.condition?.length) filter.condition = data.filterBy.condition as Condition[];
    if (data.filterBy?.stockStatus) filter.stockStatus = data.filterBy.stockStatus as StockStatus;
    if (data.filterBy?.minPrice !== undefined) filter.minPrice = data.filterBy.minPrice;
    if (data.filterBy?.maxPrice !== undefined) filter.maxPrice = data.filterBy.maxPrice;

    const result = await searchProductsByFilter({
      filter,
      pageSize: data.limit * 2,
      page: 1,
      sortBy: data.sortBy || "featured",
    });

    let list = result.items || [];

    if (data.filterBy?.isNewArrival) list = list.filter((p: any) => p.isNewArrival);
    if (data.filterBy?.isLiquidated) list = list.filter((p: any) => p.isLiquidated);
    if (data.filterBy?.isComingSoon) list = list.filter((p: any) => p.isComingSoon);
    if (data.filterBy?.hasDiscount) list = list.filter((p: any) => p.discountPrice > 0);

    products = list.slice(0, data.limit);
  } catch (e) {
    error = e as Error;
    // eslint-disable-next-line no-console
    console.error("Failed to load products:", e);
  }

  const isCarousel = data.layout === "carousel";
  const columns = data.columns || 4;

  // Map column numbers to actual Tailwind classes
  const getGridClass = (cols: number) => {
    const colsMap: Record<number, string> = {
      2: "grid grid-cols-2 md:grid-cols-2",
      3: "grid grid-cols-2 md:grid-cols-3",
      4: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
      5: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5",
      6: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
    };

    return colsMap[cols] || colsMap[4];
  };

  const gridClass = isCarousel
    ? "flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
    : `${getGridClass(columns)} gap-3 md:gap-4`;

  const loadingSkeleton = (
    <div className={className || ""}>
      <div className="container mx-auto px-4">
        <div className="h-12 bg-muted rounded-lg w-64 mb-10 animate-pulse" />
        <div className={gridClass}>
          {Array.from({ length: data.limit }).map((_, idx) => (
            <ProductCardSkeleton key={idx} template={template} />
          ))}
        </div>
      </div>
    </div>
  );

  const getEmptyMessage = () => {
    if (data.filterBy?.isNewArrival) return "No new arrivals at the moment";
    if (data.filterBy?.isLiquidated) return "No liquidated items available";
    if (data.filterBy?.isComingSoon) return "No coming soon items";
    if (data.filterBy?.hasDiscount) return "No discounted items available";
    if (data.filterBy?.categoryIds?.length) return "No products found in selected categories";
    if (data.filterBy?.brandIds?.length) return "No products found from selected brands";

    return "No products available";
  };

  return (
    <SectionContainer
      className={className || ""}
      emptyMessage={getEmptyMessage()}
      error={error}
      isEmpty={!products || products.length === 0}
      loadingSkeleton={loadingSkeleton}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance font-heading">
              {t(data.title, locale)}
            </h2>
            {data.subtitle && <p className="text-muted-foreground mt-3 text-lg">{tOpt(data.subtitle, locale)}</p>}
          </div>

        {/* VIEW ALL */}
          <Button asChild className="group self-start sm:self-auto" variant="ghost">
            <Link className="flex items-center gap-2 font-semibold" href={data.viewAllHref}>
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* CONTENT */}
        {isCarousel ? (
          <CarouselRail columns={columns} products={products || []} template={template} />
        ) : (
          <div className={gridClass}>
            {products?.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} showActions={true} size="compact" template={template} />
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
