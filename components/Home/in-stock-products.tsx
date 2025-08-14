"use client"

import { useEffect, useState } from "react"
import NextLink from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { searchProductsByFilter } from "@/app/api/services/productService"
import { ProductResponseModel } from "@/types/product"
import { StockStatus } from "@/types/enums"

export function InStockProducts() {
    const [items, setItems] = useState<ProductResponseModel[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        ; (async () => {
            try {
                const res = await searchProductsByFilter({
                    filter: { stockStatus: StockStatus.InStock, brandIds: [], categoryIds: [], condition: [] },
                    page: 1,
                    pageSize: 6,
                })
                setItems(res.items ?? [])
            } catch (e) {
                console.error(e)
                setError("Failed to load in-stock products")
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    if (loading) return (
        <section className="px-4 pb-16">
            <div className="max-w-7xl mx-auto py-10 text-text-subtle dark:text-text-subtledark">
                Loading products…
            </div>
        </section>
    )

    if (error) return (
        <section className="px-4 pb-16">
            <div className="max-w-7xl mx-auto py-10 text-red-500">{error}</div>
        </section>
    )

    if (!items.length) return null

    return (
        <section className="px-4 pb-16 bg-surface dark:bg-surfacedark">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-text-light dark:text-text-lightdark mb-2">
                            In Stock Now
                        </h2>
                        <p className="font-sans text-text-subtle dark:text-text-subtledark">
                            Ready to ship immediately
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="hidden md:flex border-primary dark:border-primarydark text-primary dark:text-primarydark hover:bg-primary hover:text-white dark:hover:bg-primarydark dark:hover:text-white transition-colors"
                    >
                        <NextLink href="/products?stock=instock">View All Products</NextLink>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(p => {
                        const discounted = typeof p.discountPrice === "number" && p.discountPrice < p.price
                        const discountPct = discounted
                            ? Math.round((1 - (p.discountPrice! / p.price)) * 100)
                            : null
                        return (
                            <NextLink
                                key={p.id}
                                href={`/product/${p.id}`}
                                className="group cursor-pointer block"
                            >
                                <div className="relative overflow-hidden rounded-lg bg-muted dark:bg-muteddark mb-4">
                                    {discounted && (
                                        <Badge className="absolute top-3 left-3 z-10 bg-red-500 text-white">
                                            {discountPct}% OFF
                                        </Badge>
                                    )}
                                    <Badge
                                        variant="secondary"
                                        className="absolute top-3 right-3 z-10 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    >
                                        In Stock
                                    </Badge>
                                    <img
                                        src={p.images?.[0] || "/placeholder.svg"}
                                        alt={p.name ?? "Product"}
                                        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                </div>
                                <h3 className="font-sans font-medium text-text-light dark:text-text-lightdark mb-1">
                                    {p.name ?? "Unnamed"}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="font-sans text-lg font-semibold text-text-light dark:text-text-lightdark">
                                        {p.discountPrice ?? p.price}
                                    </span>
                                    {discounted && (
                                        <span className="font-sans text-sm text-text-subtle dark:text-text-subtledark line-through">
                                            {p.price}
                                        </span>
                                    )}
                                </div>
                            </NextLink>
                        )
                    })}
                </div>

                <div className="text-center mt-8 md:hidden">
                    <Button
                        asChild
                        variant="outline"
                        className="border-primary dark:border-primarydark text-primary dark:text-primarydark hover:bg-primary hover:text-white dark:hover:bg-primarydark dark:hover:text-white transition-colors"
                    >
                        <NextLink href="/products?stock=instock">View All Products</NextLink>
                    </Button>
                </div>
            </div>
        </section>
    )
}
