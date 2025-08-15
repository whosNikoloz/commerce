"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import type { CategoryModel } from "@/types/category";
import type { ProductResponseModel } from "@/types/product";
import type { PagedList } from "@/types/pagination";

import { getAllCategories, getCategoryWithSubCategoriesById } from "@/app/api/services/categoryService";
import { searchProducts } from "@/app/api/services/productService";
import ProductGrid from "../CategoriesPage/ProductGrid";
import SidebarContent from "./SidebarContent";
import ProductHeader from "./ProductHeader";
import ProductPagination from "./ProductPagination";


type CategoryWithSubs = CategoryModel & { subcategories?: CategoryModel[] };

export default function SearchPage({ query = "" }: { query?: string }) {
    const [root, setRoot] = useState<CategoryWithSubs | null>(null);
    const [loadingCats, setLoadingCats] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const cards = Array.from({ length: 12 });
    const [sortBy, setSortBy] = useState("featured")


    const [products, setProducts] = useState<ProductResponseModel[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 24;

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoadingCats(true);
                const raw = (await getAllCategories(
                )) as unknown as CategoryModel[] | CategoryWithSubs;

                if (!alive) return;

                if (Array.isArray(raw)) {
                    const rootNode = raw.find((c) => c.parentId == null) ?? raw[0];
                    const subs = raw.filter((c) => c.parentId === rootNode.id);
                    setRoot({ ...rootNode, subcategories: subs });
                } else {
                    setRoot(raw);
                }
            } finally {
                if (alive) setLoadingCats(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                const resp = await searchProducts(
                    query?.trim() ?? "",
                    "name",
                    "asc",
                    currentPage,
                    pageSize
                );
                if (!alive) return;
                const r = resp as PagedList<ProductResponseModel>;
                setProducts(r.items ?? []);
                setTotalCount(
                    (r as any).totalCount ?? (r as any).total ?? r.items?.length ?? 0
                );
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [query, currentPage]);

    const categories = useMemo(() => root?.subcategories ?? [], [root]);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const buildSubHref = (sub: CategoryModel) => `/category/${sub.id}`


    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-4 lg:py-6">
                <div className="grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-8">
                    <SidebarContent
                        categorys={categories}
                        buildSubHref={buildSubHref}
                    />

                    <div className="space-y-4 lg:space-y-6">
                        <ProductHeader
                            productCount={totalCount}
                            sortBy={sortBy}
                            onSortChange={(v) => { setSortBy(v); setCurrentPage(1) }}
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
    )
}