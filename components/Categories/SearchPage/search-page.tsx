"use client";

import type { CategoryModel } from "@/types/category";
import type { ProductResponseModel } from "@/types/product";
import type { PagedList } from "@/types/pagination";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ProductGrid from "../CategoriesPage/ProductGrid";

import ProductHeader from "./ProductHeader";
import ProductPagination from "./ProductPagination";
import SideBarCategories from "./SideBarCategories";

import { searchProducts, mapSort } from "@/app/api/services/productService";
import { getAllCategories } from "@/app/api/services/categoryService";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type CategoryWithSubs = CategoryModel & { subcategories?: CategoryModel[] };

export default function SearchPage({ query = "" }: { query?: string }) {
  const [root, setRoot] = useState<CategoryWithSubs | null>(null);
  const [loadingCats, setLoadingCats] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");

  const [products, setProducts] = useState<ProductResponseModel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const isMobile = useIsMobile();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // (optional) keep page/sort in URL
  const router = useRouter();
  const params = useSearchParams();

  // bootstrap categories sidebar
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingCats(true);
        const raw = (await getAllCategories()) as unknown as CategoryModel[] | CategoryWithSubs;

        if (!alive) return;

        if (Array.isArray(raw)) {
          const rootNode = raw.find((c) => c.parentId == null) ?? raw[0];
          const subs = raw.filter((c) => c.parentId === rootNode.id);

          setRoot({ ...rootNode, subcategories: subs });
        } else {
          setRoot(raw);
        }

        // seed from URL (?page=&sort=)
        const pageFromUrl = Number(params.get("page") ?? 1);
        const sortFromUrl = params.get("sort") ?? "featured";

        setCurrentPage(Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1);
        setSortBy(sortFromUrl);
      } finally {
        if (alive) setLoadingCats(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch products (server-side paging + sorting)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // (optional) keep URL in sync
        const next = new URLSearchParams(params);

        next.set("page", String(currentPage));
        next.set("sort", sortBy);
        if (query?.trim()) next.set("q", query.trim());
        else next.delete("q");
        router.replace(`?${next.toString()}`, { scroll: false });

        const { sortColumn, sortOrder } = mapSort(sortBy);
        const resp = await searchProducts(
          query?.trim() ?? "",
          sortColumn,
          sortOrder,
          currentPage,
          pageSize,
        );

        if (!alive) return;
        const r = resp as PagedList<ProductResponseModel>;

        setProducts(r.items ?? []);
        setTotalCount((r as any).totalCount ?? (r as any).total ?? r.items?.length ?? 0);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // include sortBy + currentPage + query
  }, [query, currentPage, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const categories = useMemo(() => root?.subcategories ?? [], [root]);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const buildSubHref = (sub: CategoryModel) => `/category/${sub.id}`;

  const cards = Array.from({ length: 12 });

  return (
    <div className={cn(isMobile ? "min-h-screen" : "min-h-screen mt-16")}>
      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-8">
          <SideBarCategories buildSubHref={buildSubHref} categorys={categories} />

          <div className="space-y-4 lg:space-y-6">
            <ProductHeader
              productCount={totalCount}
              sortBy={sortBy}
              onSortChange={(v) => {
                setSortBy(v);
                setCurrentPage(1);
              }} // ← reset page on sort
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {cards.map((_, i) => (
                  <div
                    key={i}
                    className="group bg-brand-muted dark:bg-brand-muteddark border rounded-lg shadow-sm p-3 lg:p-4"
                  >
                    <div className="animate-pulse">
                      <div className="w-full aspect-square rounded-md bg-gray-300/40 dark:bg-gray-600/40" />
                      <div className="mt-3 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-20 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                          <div className="h-4 w-12 rounded bg-gray-300/30 dark:bg-gray-600/30" />
                        </div>
                        <div className="h-3 w-32 rounded bg-gray-300/30 dark:bg-gray-600/30" />
                        <div className="h-9 w-full rounded bg-gray-300/40 dark:bg-gray-600/40" />
                        <div className="h-9 w-full rounded bg-gray-300/30 dark:bg-gray-600/30" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid products={products} viewMode={viewMode} />
            )}

            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
