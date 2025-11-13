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
import { getCachedMerchantType } from "@/app/context/tenantContext";
import { useUser } from "@/app/context/userContext";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductNotFound from "@/app/[lang]/product/[id]/not-found";
import { useFlyToCart } from "@/hooks/use-fly-to-cart";
import { locales, defaultLocale } from "@/i18n.config";

type Props = { initialProduct: ProductResponseModel; initialSimilar: ProductResponseModel[] };

export default function ProductDetail({ initialProduct, initialSimilar }: Props) {
  const { user } = useUser();
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [stockQuantity, setStockQuantity] = useState<number | undefined>(undefined);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initialize selectedFacets synchronously to avoid hydration mismatch
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedFacets, _setSelectedFacets] = useState<Record<string, string>>(() => {
    const initialFacets: Record<string, string> = {};

    initialProduct.productFacetValues?.forEach(facet => {
      if (facet.facetName && facet.facetValue && facet.isSelected) {
        initialFacets[facet.facetName] = facet.facetValue;
      }
    });

    return initialFacets;
  });
  const addToCart = useCartStore((s) => s.smartAddToCart);
  const isMobile = useIsMobile();
  const [notFound, setNotFound] = useState(false);
  const imageReviewRef = useRef<ImageReviewHandle>(null);
  const { flyToCart } = useFlyToCart({ durationMs: 800, rotateDeg: 0, scaleTo: 0.1, curve: 0.4 });

  const handleFacetChange = async (facetName: string, facetValue: string, targetFacetValueId?: string) => {

    if (!targetFacetValueId) {
      // eslint-disable-next-line no-console
      console.log("Available product facet values:", product.productFacetValues);
      toast.error("ვერ მოხერხდა ვარიანტის ჩატვირთვა - facetValueId არ არის");

      return;
    }

    try {
      const targetProduct = await getProductById(
        product.id, 
        product.id,
        targetFacetValueId
      );

      if (!targetProduct || !targetProduct.id) {
        toast.error("პროდუქტის ვარიანტი არ მოიძებნა");

        return;
      }

      if (targetProduct.id === product.id) {
        // Same variant, no need to navigate
        return;
      }

      // Build the URL path for the variant
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const firstSegment = pathParts[0];

      // Check if first segment is a valid locale
      const isValidLocale = locales.includes(firstSegment as any);
      const lang = isValidLocale ? firstSegment : null;

      // Build the new path
      const newPath = lang && lang !== defaultLocale
        ? `/${lang}/product/${targetProduct.id}`
        : `/product/${targetProduct.id}`;

      // Navigate to the new variant page
      router.push(newPath);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching product variant:", error);
      toast.error("ვერ მოხერხდა ვარიანტის ჩატვირთვა");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_similar] = useState(initialSimilar);
  const [isPriceVisible, setIsPriceVisible] = useState(true);

  // Fetch real-time stock quantity
  const fetchStock = useCallback(async (silent = false) => {
    const merchantType = getCachedMerchantType();

    if (merchantType !== "FINA") {
      setStockLoading(false);
      setIsInitialLoad(false);

      return;
    }

    const TIMEOUT_MS = 8000;
    const MAX_RETRIES = 3;

    let attempt = 0;

    // Only show loading state on initial load or non-silent updates
    if (!silent) {
      setStockLoading(true);
      setStockError(null);
    }

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
        setIsInitialLoad(false);

        return; // success
      } catch (err: any) {
        clearTimeout(timeout);

        // If aborted or network down, decide to retry or fail fast
        const isAbort = err?.name === "AbortError";
        const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

        if (attempt >= MAX_RETRIES || isOffline || isAbort) {
          // Only set error if not silent update
          if (!silent) {
            setStockQuantity(undefined); // "unknown"
            setStockError("ვერ მოხერხდა მარაგის შემოწმება");
          }
          setStockLoading(false);
          setIsInitialLoad(false);

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

    const run = async (silent = false) => {
      if (cancelled) return;
      await fetchStock(silent);
    };

    // Initial load - show loading
    run(false);

    // Subsequent updates - silent (background refresh)
    const stockInterval = setInterval(() => run(true), 30_000);

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
    // Only validate stock for FINA merchants
    const merchantType = getCachedMerchantType();

    if (merchantType === "FINA") {
      if (isInitialLoad && stockLoading) {
        toast.error("იტვირთება მარაგი… გთხოვთ მოითმინოთ");

        return;
      }
      if (stockError && stockQuantity === undefined) {
        toast.error("ვერ მოხერხდა მარაგის შემოწმება. სცადეთ თავიდან.");

        return;
      }
      if (stockQuantity !== undefined && stockQuantity <= 0) {
        toast.error("პროდუქტი მარაგში არ არის");

        return;
      }
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
    };

    await addToCart(item);

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
    if (!(isInitialLoad && stockLoading) && !stockError) router.push("/cart");
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
    if (!product.productFacetValues?.length) {
      return [];
    }


    // Group facets by facetName - each facet can have multiple values with different variant IDs
    const grouped = product.productFacetValues.reduce(
      (acc, f) => {
        const name = f.facetName ?? "";

        if (!acc[name]) acc[name] = [];

        // Check if this value already exists
        const existingIndex = acc[name].findIndex(item => item.value === f.facetValue);

        if (existingIndex >= 0) {
          // Update existing entry, prioritizing isSelected=true
          const existing = acc[name][existingIndex];

          acc[name][existingIndex] = {
            value: f.facetValue ?? "",
            facetValueId: f.facetValueId ?? existing.facetValueId,
            isReachable: f.isReachable ?? existing.isReachable,
            isSelected: f.isSelected || existing.isSelected, // Keep true if either is true
          };
        } else {
          // Value doesn't exist yet, add it
          acc[name].push({
            value: f.facetValue ?? "",
            facetValueId: f.facetValueId,
            isReachable: f.isReachable,
            isSelected: f.isSelected,
          });
        }

        return acc;
      },
      {} as Record<string, Array<{ value: string; facetValueId?: string; isReachable?: boolean; isSelected?: boolean }>>,
    );

    // Convert grouped facets to specifications format
    const enrichedSpecs = Object.entries(grouped).map(([facetName, facetValues]) => ({
      facetName,
      facetValues,
    }));

    return [
      {
        headline: "Specifications",
        specifications: enrichedSpecs,
      },
    ];
  }, [product.productFacetValues]);

  const price = product.discountPrice ?? product.price;
  const originalPrice = product.discountPrice ? product.price : undefined;

  if (notFound) return <ProductNotFound />;

  return (
    <div className="container mx-auto text-text-light dark:text-text-lightdark relative">
      <h1 className="text-3xl font-bold mb-2 md:block hidden p-4">
        {product.name ?? "პროდუქტი"}
      </h1>

      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        <div className="flex-1 max-w-[800px] order-1 lg:order-1">
          <ImageReview ref={imageReviewRef} images={galleryImages} productName={product.name ?? ""} />
        </div>

        <h1 className="text-3xl md:hidden block font-bold order-2 lg:order-2">
          {product.name}
        </h1>

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
              stockLoading={isInitialLoad && stockLoading}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
        </div>

        <div className="order-4 lg:order-2 flex md:items-start place-items-start">
          <div
            dangerouslySetInnerHTML={{ __html: product.description ?? "" }}
            className={[
              "rich-content max-w-xs mx-auto md:ml-5",
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
        <div key={i} className="my-12 relative">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-gradient-to-b from-brand-primary to-brand-primary/50 rounded-full" />
            Specifications
          </h2>
          <Specifications
            specs={g.specifications}
            value={selectedFacets}
            onChange={handleFacetChange}
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
