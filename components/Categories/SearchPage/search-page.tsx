"use client";

import type { CategoryModel } from "@/types/category";
import type { ProductResponseModel } from "@/types/product";
import type { PagedList } from "@/types/pagination";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ProductGrid from "../CategoriesPage/ProductGrid";
import { SkeletonProductGrid } from "../CategoriesPage/SkeletonProductGrid";

import ProductHeader from "./ProductHeader";
import ProductPagination from "./ProductPagination";
import SideBarCategories from "./SideBarCategories";

import { searchProducts, mapSort } from "@/app/api/services/productService";
import { getAllCategories } from "@/app/api/services/categoryService";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SearchPage({ query = "" }: { query?: string }) {
  // ✅ store ALL categories (flat)
  const [allCategories, setAllCategories] = useState<CategoryModel[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");

  const [products, setProducts] = useState<ProductResponseModel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const isMobile = useIsMobile();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  const router = useRouter();
  const params = useSearchParams();

  // 🔹 Load ALL categories (no subcategory filtering)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingCats(true);
        const raw = (await getAllCategories()) as unknown as CategoryModel[] | CategoryModel;

        if (!alive) return;

        if (Array.isArray(raw)) {
          setAllCategories(raw.filter((c) => c.parentId == null));
        } else if (raw) {
          if (raw.parentId == null) {
            setAllCategories([raw]);
          } else {
            setAllCategories([]);
          }
        } else {
          setAllCategories([]);
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

  // 🔹 Fetch products (server paging + sorting)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // sync URL (query, sort, page)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentPage, sortBy]);

  // 🔹 Use ALL categories in the sidebar
  const categories = useMemo(() => allCategories, [allCategories]);
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
              <SkeletonProductGrid count={12} />
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
