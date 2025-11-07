"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProductInfo } from "./product-info";
import { ProductInfoBottom } from "./product-info-bottom";
import { Specifications } from "./specifications";
import { ImageReview, ImageReviewHandle } from "./image-review";

import { ProductResponseModel } from "@/types/product";
import { getProductById, getProductRestsByIds } from "@/app/api/services/productService";
import { CartItem, useCartStore } from "@/app/context/cartContext";
import { useUser } from "@/app/context/userContext";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductNotFound from "@/app/[lang]/product/[id]/not-found";
import { useFlyToCart } from "@/hooks/use-fly-to-cart";

type Props = { initialProduct: ProductResponseModel; initialSimilar: ProductResponseModel[] };

export default function ProductDetail({ initialProduct, initialSimilar }: Props) {
  const { user } = useUser();
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string>>({});
  const [stockQuantity, setStockQuantity] = useState<number | undefined>(undefined);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState<string | null>(null);
  const addToCart = useCartStore((s) => s.checkAndAddToCart);
  const isMobile = useIsMobile();
  const [notFound, setNotFound] = useState(false);
  const imageReviewRef = useRef<ImageReviewHandle>(null);
  const { flyToCart } = useFlyToCart({ durationMs: 800, rotateDeg: 0, scaleTo: 0.1, curve: 0.4 });
  
  const setSelectedFacetsSafe = (next: Record<string, string>) =>
    setSelectedFacets((prev) => {
      const pk = Object.keys(prev),
        nk = Object.keys(next);

      if (pk.length === nk.length && pk.every((k) => prev[k] === next[k])) return prev;

      return next;
    });

  const [similar] = useState(initialSimilar);
  const [isPriceVisible, setIsPriceVisible] = useState(true);

  // Fetch real-time stock quantity
  const fetchStock = useCallback(async () => {
    const TIMEOUT_MS = 8000;     // 8s timeout per attempt
    const MAX_RETRIES = 3;

    let attempt = 0;

    setStockLoading(true);
    setStockError(null);

    while (attempt < MAX_RETRIES) {
      attempt++;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const stockResponse = await getProductRestsByIds({ prods: [product.id] },);

        clearTimeout(timeout);

        const stockInfo = stockResponse?.summedRests?.find?.((s: any) => s.id === product.id);

        setStockQuantity(stockInfo?.totalRest ?? 0);
        setStockLoading(false);
        setStockError(null);

        return; // success
      } catch (err: any) {
        clearTimeout(timeout);

        // If aborted or network down, decide to retry or fail fast
        const isAbort = err?.name === "AbortError";
        const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

        if (attempt >= MAX_RETRIES || isOffline || isAbort) {
          setStockQuantity(undefined); // “unknown”
          setStockLoading(false);
          setStockError("ვერ მოხერხდა მარაგის შემოწმება");

          return;
        }

        // Exponential backoff with small jitter
        const backoff = 500 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 200);

        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }, [product.id]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await fetchStock();
    };

    run();
    const stockInterval = setInterval(run, 30_000);

    return () => {
      cancelled = true;
      clearInterval(stockInterval);
    };
  }, [fetchStock]);

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

  const handleAddToCart = async () => {
    if (stockLoading) {
      toast.error("იტვირთება მარაგი… გთხოვთ მოითმინოთ");

      return;
    }
    if (stockError) {
      toast.error("ვერ მოხერხდა მარაგის შემოწმება. სცადეთ თავიდან.");

      return;
    }
    if (stockQuantity !== undefined && stockQuantity <= 0) {
      toast.error("პროდუქტი მარაგში არ არის");

      return;
    }

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

    // Trigger fly-to-cart animation
    const imageElement = imageReviewRef.current?.getCurrentImageElement();
    if (imageElement) {
      await flyToCart(imageElement);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error("გთხოვთ, ჯერ გაიაროთ ავტორიზაცია");

      return;
    }
    handleAddToCart();
    if (!stockLoading && !stockError) router.push("/cart");
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
          <ImageReview ref={imageReviewRef} images={galleryImages} productName={product.name ?? ""} />
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
              stock={stockQuantity}
              stockError={stockError ?? undefined}   
              stockLoading={stockLoading} 
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
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
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-gradient-to-b from-brand-primary to-brand-primary/50 rounded-full" />
            Specifications
          </h2>
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
        stock={stockQuantity}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </div>
  );
}
