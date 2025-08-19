"use client";

import { getProductById } from "@/app/api/services/productService";
import { ProductResponseModel } from "@/types/product";
import { useState, useEffect, useMemo } from "react";
import { ProductInfo } from "./product-info";
import { ProductInfoBottom } from "./product-info-bottom";
import { SimilarProducts } from "./similar-products";
import { Specifications } from "./specifications";
import { ImageReview } from "./image-review";
import { CartItem, useCart } from "@/app/context/cartContext";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  initialProduct: ProductResponseModel;
  initialSimilar: ProductResponseModel[];
};

export default function ProductDetail({ initialProduct, initialSimilar }: Props) {
  const [product, setProduct] = useState(initialProduct);
  const { addToCart } = useCart();
  const isMobile = useIsMobile();


  const [similar, setSimilar] = useState(initialSimilar);
  const [isPriceVisible, setIsPriceVisible] = useState(true);

  // --- live refresh every 30s (price/stock/etc) ---
  useEffect(() => {
    const tick = async () => {
      try {
        const fresh = await getProductById(product.id);
        setProduct(fresh);
      } catch (e) {
        // silently ignore; keep last good data
      }
    };
    const iv = setInterval(tick, 30_000);
    return () => clearInterval(iv);
  }, [product.id]);

  const handleAddToCart = () => {
    const item: CartItem = {
      id: product.id,
      name: product.name ?? "Unnamed Product",
      price: product.discountPrice ?? product.price,
      image: product.images?.[0] ?? "/placeholder.png",
      quantity: 1,
      discount: product.discountPrice ? Math.max(0, Math.round(((product.price - product.discountPrice) / product.price) * 100)) : 0,
      originalPrice: product.price,
    };

    addToCart(item);
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = isMobile ? 900 : 700;
      setIsPriceVisible(window.scrollY < scrollThreshold);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const galleryImages = useMemo(() => {
    return (product.images ?? []).filter((u) => typeof u === "string" && u.trim());
  }, [product.images]);

  const specs = useMemo(() => {
    if (!product.productFacetValues?.length) return [];

    const grouped = product.productFacetValues.reduce((acc, f) => {
      const name = f.facetName ?? "";
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(f.facetValue ?? "");
      return acc;
    }, {} as Record<string, string[]>);

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


  const similarProducts = useMemo(
    () =>
      similar.map((p) => ({
        id: typeof p.id === "string" ? Number(p.id) : p.id,
        name: p.name ?? "Unnamed",
        price: p.discountPrice ?? p.price,
        rating: 0, // your API doesn’t expose rating; fill if available
        image: p.images?.[0] ?? "/placeholder.png",
      })),
    [similar]
  );

  const price = product.discountPrice ?? product.price;
  const originalPrice = product.discountPrice ? product.price : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 md:block hidden p-4">
        {product.name ?? "პროდუქტი"}
      </h1>

      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        <div className="flex-1">
          <ImageReview images={galleryImages} productName={product.name ?? ""} />
        </div>

        <h1 className="text-3xl md:hidden block font-bold">{product.name}</h1>

        {product.description && (
          <div className="flex md:items-start place-items-start">
            <div
              className={[
                "rich-content max-w-md ml-5",
                "prose prose-sm dark:prose-invert",
                "prose-ul:list-disc prose-ol:list-decimal",
                "prose-li:my-1 prose-p:my-2",
                "whitespace-pre-wrap break-words"
              ].join(" ")}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        <ProductInfo
          discount={originalPrice ? Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100)) : 0}
          originalPrice={originalPrice ?? null}
          status={product.status}
          condition={product.condition}
          price={price}
          onAddToCart={handleAddToCart}
          onBuyNow={() => console.log("Buy now clicked")}
          brand={product.brand?.name ?? ""}
          isComingSoon={product.isComingSoon}
          isNewArrival={product.isNewArrival}
          isLiquidated={product.isLiquidated}
        />
      </div>

      {/* <SimilarProducts products={similarProducts} /> */}

      {product.brand && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">ბრენდის ისტორია : {product.brand.name}</h2>
          <div className="prose prose-sm dark:prose-invert">
            <div className="flex md:items-start place-items-start">
              <div
                className={[
                  "rich-content max-w-md",
                  "prose prose-sm dark:prose-invert",
                  "prose-ul:list-disc prose-ol:list-decimal",
                  "prose-li:my-1 prose-p:my-2",
                  "whitespace-pre-wrap break-words"
                ].join(" ")}
                dangerouslySetInnerHTML={{ __html: product.brand.description ?? "" }}
              />
            </div>
          </div>
        </div>

      )}

      {specs.map((g, i) => (
        <div key={i} className="my-12">
          <h1 className="font-bold mb-6 text-2xl">{g.headline}</h1>
          <Specifications specs={g.specifications} />
        </div>
      ))}

      <ProductInfoBottom
        discount={originalPrice ? Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100)) : 0}
        isVisible={!isPriceVisible}
        name={product.name ?? ""}
        originalPrice={originalPrice}
        price={price}
        stock={product.status}
        status={product.status}
        condition={product.condition}
        image={product.images?.[0] ?? "/placeholder.png"}
        brand={product.brand?.name ?? ""}
        isComingSoon={product.isComingSoon}
        isNewArrival={product.isNewArrival}
        isLiquidated={product.isLiquidated}
        onAddToCart={handleAddToCart}
        onBuyNow={() => console.log("Buy now clicked")}
      />
    </div>
  );
}
