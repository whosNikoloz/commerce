"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getAllCategories } from "@/app/api/services/categoryService"
import { CategoryModel } from "@/types/category"
import Link from "next/link"

export function CategoryCarousel() {
    const [categories, setCategories] = useState<CategoryModel[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        ; (async () => {
            try {
                const data = await getAllCategories()
                setCategories(data)
            } catch (e) {
                console.error(e)
                setError("Failed to load categories")
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const parentCategories = useMemo(
        () => categories.filter(c => !c.parentId || c.parentId.trim() === ""),
        [categories]
    )

    const childrenByParent = useMemo(() => {
        const map = new Map<string, CategoryModel[]>()
        for (const c of categories) {
            const pid = c.parentId?.trim()
            if (pid) {
                if (!map.has(pid)) map.set(pid, [])
                map.get(pid)!.push(c)
            }
        }
        return map
    }, [categories])

    if (loading) return <div className="text-center py-10">Loading categories...</div>
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>
    if (!parentCategories.length) return <div className="text-center py-10">No parent categories found.</div>

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parentCategories.map((parent) => {
                    const children = childrenByParent.get(parent.id) ?? []
                    const go = () => router.push(`/search/${parent.id}`)
                    const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            go()
                        }
                    }

                    return (
                        <div
                            key={parent.id}
                            role="link"
                            tabIndex={0}
                            onClick={go}
                            onKeyDown={onKey}
                            className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={`/images/categories/${parent.id}.png`}
                                    alt={parent.name || "Category"}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {parent.name || "Unnamed"}
                                    </h3>
                                    {children.length > 0 && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                            {children.length} subcategories
                                        </span>
                                    )}
                                </div>

                                <p className="font-sans text-slate-600 text-sm mb-4 leading-relaxed">
                                    {parent.description || " "}
                                </p>

                                {children.length > 0 && (
                                    <div className="mb-4 -m-1 flex flex-wrap">
                                        {children.map(child => (
                                            <Link
                                                key={child.id}
                                                href={`/search/${child.id}`}
                                                onClick={(e) => e.stopPropagation()} // prevent triggering parent card click
                                                className="m-1 inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                                            >
                                                {child.name ?? "—"}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                <Button
                                    onClick={(e) => { e.stopPropagation(); go() }}
                                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-sans font-medium transition-colors duration-300"
                                    size="sm"
                                >
                                    Shop {parent.name ?? "Category"}
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
