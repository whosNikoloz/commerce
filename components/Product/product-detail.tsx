"use client";

import { useState, useEffect, useMemo } from "react";

import { ProductInfo } from "./product-info";
import { ProductInfoBottom } from "./product-info-bottom";
import { Specifications } from "./specifications";
import { ImageReview } from "./image-review";

import { ProductResponseModel } from "@/types/product";
import { getProductById } from "@/app/api/services/productService";
import { CartItem, useCartStore } from "@/app/context/cartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductNotFound from "@/app/[lang]/product/[id]/not-found";

type Props = { initialProduct: ProductResponseModel; initialSimilar: ProductResponseModel[] };

export default function ProductDetail({ initialProduct, initialSimilar }: Props) {
  const [product, setProduct] = useState(initialProduct);
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string>>({});
  const addToCart = useCartStore((s) => s.checkAndAddToCart);
  const isMobile = useIsMobile();
  const [notFound, setNotFound] = useState(false);

  const setSelectedFacetsSafe = (next: Record<string, string>) =>
    setSelectedFacets((prev) => {
      const pk = Object.keys(prev),
        nk = Object.keys(next);

      if (pk.length === nk.length && pk.every((k) => prev[k] === next[k])) return prev;

      return next;
    });

  const [similar] = useState(initialSimilar);
  const [isPriceVisible, setIsPriceVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const fresh = await getProductById(product.id);

        if (!cancelled) setProduct(fresh);
      } catch {
        if (!cancelled) setNotFound(true);
      }
    };

    tick();
    const iv = setInterval(tick, 30_000);

    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [product.id]);

  const handleAddToCart = () => {
    const item: CartItem = {
      id: product.id,
      name: product.name ?? "Unnamed Product",
      price: product.discountPrice ?? product.price,
      image: product.images?.[0] ?? "/placeholder.png",
      quantity: 1,
      discount: product.discountPrice
        ? Math.max(0, Math.round(((product.price - product.discountPrice) / product.price) * 100))
        : 0,
      originalPrice: product.price,
      selectedFacets,
    };

    addToCart(item);
  };

  useEffect(() => {
    const handleScrollOrResize = () => {
      const scrollThreshold = isMobile ? 900 : 700;

      setIsPriceVisible(window.scrollY < scrollThreshold);
    };

    handleScrollOrResize();
    window.addEventListener("scroll", handleScrollOrResize);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isMobile]);

  const galleryImages = useMemo(
    () => (product.images ?? []).filter((u) => typeof u === "string" && u.trim()),
    [product.images],
  );

  const specs = useMemo(() => {
    if (!product.productFacetValues?.length) return [];
    const grouped = product.productFacetValues.reduce(
      (acc, f) => {
        const name = f.facetName ?? "";

        if (!acc[name]) acc[name] = [];
        acc[name].push(f.facetValue ?? "");

        return acc;
      },
      {} as Record<string, string[]>,
    );

    return [
      {
        headline: "Specifications",
        specifications: Object.entries(grouped).map(([facetName, facetValues]) => ({
          facetName,
          facetValues,
        })),
      },
    ];
  }, [product.productFacetValues]);

  const price = product.discountPrice ?? product.price;
  const originalPrice = product.discountPrice ? product.price : undefined;

  if (notFound) return <ProductNotFound />;

  return (
    <div className="container mx-auto px-4 text-text-light dark:text-text-lightdark">
      <h1 className="text-3xl font-bold mb-2 md:block hidden p-4">{product.name ?? "პროდუქტი"}</h1>

      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        <div className="flex-1 max-w-[800px] order-1 lg:order-1">
          <ImageReview images={galleryImages} productName={product.name ?? ""} />
        </div>

        <h1 className="text-3xl md:hidden block font-bold order-2 lg:order-2">{product.name}</h1>

        <div className="order-3 lg:order-3 lg:min-w-[320px] lg:max-w-sm lg:sticky lg:top-24 lg:self-start lg:h-fit">
          <ProductInfo
            brand={product.brand?.name ?? ""}
            condition={product.condition}
            discount={
              originalPrice
                ? Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100))
                : 0
            }
            isComingSoon={product.isComingSoon}
            isLiquidated={product.isLiquidated}
            isNewArrival={product.isNewArrival}
            originalPrice={originalPrice ?? null}
            price={price}
            status={product.status}
            onAddToCart={handleAddToCart}
            onBuyNow={() => {}}
          />
        </div>

        <div className="order-4 lg:order-2 flex md:items-start place-items-start">
          <div
            dangerouslySetInnerHTML={{ __html: product.description ?? "" }}
            className={[
              "rich-content max-w-md mx-auto md:ml-5",
              "prose prose-sm dark:prose-invert",
              "prose-ul:list-disc prose-ol:list-decimal",
              "prose-li:my-1 prose-p:my-2",
              "whitespace-pre-wrap break-words",
              "text-text-light dark:text-text-lightdark",
            ].join(" ")}
          />
        </div>
      </div>

      {specs.map((g, i) => (
        <div key={i} className="my-12">
          <h1 className="font-bold mb-6 text-2xl">{g.headline}</h1>
          <Specifications
            specs={g.specifications}
            value={selectedFacets}
            onChange={setSelectedFacetsSafe}
          />
        </div>
      ))}

      <ProductInfoBottom
        brand={product.brand?.name ?? ""}
        condition={product.condition}
        discount={
          originalPrice
            ? Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100))
            : 0
        }
        image={product.images?.[0] ?? "/placeholder.png"}
        isComingSoon={product.isComingSoon}
        isLiquidated={product.isLiquidated}
        isNewArrival={product.isNewArrival}
        isVisible={!isPriceVisible}
        name={product.name ?? ""}
        originalPrice={originalPrice}
        price={price}
        status={product.status}
        stock={product.status}
        onAddToCart={handleAddToCart}
        onBuyNow={() => {}}
      />
    </div>
  );
}
