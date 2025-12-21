"use client";

import type { ProductResponseModel } from "@/types/product";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { X, Share2, ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { getProductById } from "@/app/api/services/productService";
import { Button } from "@/components/ui/button";
import { cn, formatPrice, resolveImageUrl } from "@/lib/utils";
import { useCompareStore } from "@/app/context/compareContext";
import { useDictionary } from "@/app/context/dictionary-provider";

export default function CompareProductsPage() {
  const searchParams = useSearchParams();
  const { lang } = useParams<{ lang?: string }>();
  const router = useRouter();
  const dict = useDictionary();
  const t = dict.compare;

  const currentLang = (lang as string) || "en";
  const [products, setProducts] = useState<ProductResponseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const { clearCompare, removeFromCompare } = useCompareStore();

  useEffect(() => {
    const ids = searchParams.get("ids")?.split(",") || [];

    if (ids.length === 0) {
      setLoading(false);

      return;
    }

    const fetchProducts = async () => {
      try {
        const productsData = await Promise.all(
          ids.map((id) => getProductById(id.trim()))
        );

        setProducts(productsData.filter(Boolean) as ProductResponseModel[]);
      } catch (__error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching products:", __error);
        toast.error(t.status.errorLoadingProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, t.status.errorLoadingProducts]);

  const handleRemoveProduct = (productId: string) => {
    const updatedProducts = products.filter((p) => p.id !== productId);

    setProducts(updatedProducts);
    removeFromCompare(productId);

    if (updatedProducts.length === 0) {
      router.push(`/${currentLang}`);
    } else {
      const ids = updatedProducts.map((p) => p.id).join(",");

      router.push(
        `/${currentLang}/compare-products?ids=${encodeURIComponent(ids)}`
      );
    }
  };

  const handleClearAll = () => {
    clearCompare();
    router.push(`/${currentLang}`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: t.share.title,
        url: window.location.href,
      });
    } catch (_error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t.status.linkCopied);
    }
  };

  const getFacetGroups = () => {
    if (products.length === 0) return {};

    const groups: Record<string, Array<{ name: string; values: string[] }>> = {};

    products.forEach((product, index) => {
      product.productFacetValues.forEach((facet) => {
        const facetName = facet.facetName || t.labels.otherFacet;
        const facetValue = facet.facetValue || "-";

        if (!groups[facetName]) {
          groups[facetName] = products.map(() => ({ name: facetName, values: [] }));
        }

        groups[facetName][index].values.push(facetValue);
      });
    });

    Object.keys(groups).forEach((facetName) => {
      groups[facetName].forEach((item, index) => {
        if (item.values.length === 0) {
          groups[facetName][index].values = ["-"];
        }
      });
    });

    return groups;
  };

  const facetGroups = getFacetGroups();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-primary text-slate-600 dark:text-slate-400">
            {t.status.loading}
          </p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t.page.title}
          </h1>
          <p className="font-primary text-slate-600 dark:text-slate-400 mb-8">
            {t.page.emptySubtitle}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push(`/${currentLang}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.page.backToHome}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-4xl font-bold text-slate-900 dark:text-white mb-6">
            {t.page.title}
          </h1>
          <div className="flex flex-wrap gap-3">
            <Button
              className="rounded-lg"
              size="sm"
              variant={showDifferencesOnly ? "default" : "outline"}
              onClick={() =>
                setShowDifferencesOnly((prev) => !prev)
              }
            >
              {showDifferencesOnly
                ? t.actions.showAll
                : t.actions.differences}
            </Button>
            <Button
              className="rounded-lg bg-transparent"
              size="sm"
              variant="outline"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {t.actions.share}
            </Button>
            <Button
              className="rounded-lg bg-transparent"
              size="sm"
              variant="outline"
              onClick={handleClearAll}
            >
              {t.actions.clearAll}
            </Button>
          </div>
        </div>

        {/* Product Cards - Horizontal Scroll */}
        <div className="mb-12 overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-4 min-w-max">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                currentLang={currentLang}
                product={product}
                onRemove={handleRemoveProduct}
              />
            ))}

            {products.length < 4 && (
              <div className="flex-shrink-0 w-52 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                <Button
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  variant="ghost"
                  onClick={() => router.push(`/${currentLang}`)}
                >
                  + {t.actions.addProduct}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                <CompareRow
                  label={t.labels.brand}
                  showDifferencesOnly={showDifferencesOnly}
                  values={products.map((p) => [p.brand?.name || "-"])}
                />
                <CompareRow
                  label={t.labels.category}
                  showDifferencesOnly={showDifferencesOnly}
                  values={products.map((p) => [p.category?.name || "-"])}
                />
                <CompareRow
                  label={t.labels.price}
                  showDifferencesOnly={showDifferencesOnly}
                  values={products.map((p) => [
                    formatPrice(p.discountPrice || p.price),
                  ])}
                />
                {Object.entries(facetGroups).map(([facetName, items]) => (
                  <CompareRow
                    key={facetName}
                    label={facetName}
                    showDifferencesOnly={showDifferencesOnly}
                    values={items.map((item) => item.values)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: ProductResponseModel;
  onRemove: (id: string) => void;
  currentLang: string;
}

function ProductCard({ product, onRemove, currentLang }: ProductCardProps) {
  const dict = useDictionary();
  const t = dict.compare;

  return (
    <div className="flex-shrink-0 w-52 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Product Image */}
      <div className="relative h-40 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <Image
          fill
          unoptimized
          alt={product.name || "Product"}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          src={
            resolveImageUrl(product.images?.[0]) ||
            "/placeholder.png"
          }
        />
        <button className="font-primary absolute top-2 right-2 p-1.5 bg-white dark:bg-slate-800 hover:bg-red-500 dark:hover:bg-red-600 hover:text-white rounded-full transition-colors shadow-md"
          onClick={() => onRemove(product.id)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-3.5">
        <Link
          className="font-semibold text-sm line-clamp-2 text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block mb-2.5"
          href={`/${currentLang}/product/${product.id}`}
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-primary text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(product.discountPrice || product.price)}
          </span>
          {product.discountPrice && (
            <span className="font-primary text-xs text-slate-500 dark:text-slate-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="font-primary text-slate-600 dark:text-slate-400">
              {t.labels.brandInline}
            </span>
            <span className="font-primary font-medium text-slate-900 dark:text-slate-100">
              {product.brand?.name || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-primary text-slate-600 dark:text-slate-400">
              {t.labels.categoryInline}
            </span>
            <span className="font-primary font-medium text-slate-900 dark:text-slate-100">
              {product.category?.name || "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CompareRowProps {
  label: string;
  values: string[][];
  showDifferencesOnly: boolean;
}

function CompareRow({ label, values, showDifferencesOnly }: CompareRowProps) {
  const areAllSame = values.every(
    (v) => v.join(",") === values[0].join(","),
  );

  if (showDifferencesOnly && areAllSame) {
    return null;
  }

  return (
    <tr className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors last:border-b-0">
      <td className="p-4 font-semibold text-slate-900 dark:text-white min-w-40 bg-slate-50 dark:bg-slate-800/50">
        {label}
      </td>
      {values.map((val, index) => (
        <td
          key={index}
          className={cn(
            "p-4 text-sm min-w-40",
            !areAllSame &&
            val[0] !== "-" &&
            "font-semibold text-blue-600 dark:text-blue-400",
          )}
        >
          <div className="flex items-start gap-2">
            {val[0] !== "-" && !areAllSame && (
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            )}
            <span className="font-primary text-slate-700 dark:text-slate-300">
              {val.join(", ")}
            </span>
          </div>
        </td>
      ))}
    </tr>
  );
}
