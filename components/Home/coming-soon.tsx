"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAllProducts } from "@/app/api/services/productService"
import { ProductResponseModel } from "@/types/product"

export function ComingSoon() {
    const [items, setItems] = useState<ProductResponseModel[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        ; (async () => {
            try {
                const all = await getAllProducts()
                // take top 6 coming soon
                const filtered = all.filter(p => p.isComingSoon).slice(0, 6)
                setItems(filtered)
            } catch (e) {
                console.error(e)
                setError("Failed to load coming soon")
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    if (loading) return <section className="px-4 py-16"><div className="max-w-7xl mx-auto py-10">Loading…</div></section>
    if (error) return <section className="px-4 py-16"><div className="max-w-7xl mx-auto py-10 text-red-500">{error}</div></section>
    if (!items.length) return null

    return (
        <section className="px-4 py-16">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl font-bold text-slate-700 mb-2">Coming Soon</h2>
                    <p className="font-sans text-slate-600">Get ready for these exciting releases</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {items.map((p) => (
                        <div
                            key={p.id}
                            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <div className="relative">
                                {/* If you have a real release date, place it here */}
                                <Badge className="absolute top-3 right-3 z-10 bg-cyan-500 text-white">Soon</Badge>
                                <img
                                    src={p.images?.[0] || "/placeholder.svg"}
                                    alt={p.name ?? "Product"}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                            <div className="p-6">
                                <h3 className="font-serif text-xl font-semibold text-slate-700 mb-2">{p.name ?? "Unnamed"}</h3>
                                <p className="font-sans text-slate-600 mb-3 line-clamp-2">{p.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-sans text-lg font-semibold text-slate-900">
                                        {(p.discountPrice ?? p.price)}
                                    </span>
                                    <Button size="sm" variant="outline">
                                        Notify Me
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
