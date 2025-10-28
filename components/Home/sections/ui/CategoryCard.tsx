import Link from "next/link"
import Image from "next/image"
import type { CategoryModel } from "@/types/category"
import { ArrowRight, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CategoryCardProps {
  category: CategoryModel
  imageUrl?: string
  productCount?: number
  template?: 1 | 2 | 3
  className?: string
}

export function CategoryCard({
  category,
  imageUrl = "/placeholder.svg",
  productCount,
  template = 1,
  className = "",
}: CategoryCardProps) {
  const href = `/category/${category.id}`

  return (
    <Link href={href} className={`group block ${className}`}>
      <Card className="relative overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 group-hover:-translate-y-2 bg-card/80 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full" />

        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted/20">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={category.name || "Category"}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 group-hover:via-black/50 transition-all duration-500" />

          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 transform -translate-x-2 group-hover:translate-x-0">
                  <Sparkles className="h-4 w-4 text-primary/80" />
                  <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Explore</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300 leading-tight text-balance">
                  {category.name}
                </h3>

                {productCount !== undefined && (
                  <Badge
                    variant="secondary"
                    className="bg-white/15 text-white/95 hover:bg-white/25 border border-white/20 backdrop-blur-md shadow-lg font-medium px-3 py-1 transition-all duration-300 group-hover:scale-105"
                  >
                    <span className="text-sm">{productCount}</span>
                    <span className="text-xs ml-1 opacity-90">products</span>
                  </Badge>
                )}
              </div>

              <div className="relative">
                {/* Background glow effect */}
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Arrow button */}
                <div className="relative w-12 h-12 rounded-full bg-primary/25 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-lg">
                  <ArrowRight className="h-5 w-5 text-white transform group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </div>
        </div>
      </Card>
    </Link>
  )
}

export function CategoryCardSkeleton({ template = 1 }: { template?: 1 | 2 | 3 }) {
  const cardStyles = {
    1: "rounded-2xl overflow-hidden bg-card border border-border",
    2: "rounded-3xl overflow-hidden bg-card border-2 border-border",
    3: "rounded-xl overflow-hidden bg-card border-2 border-border",
  }

  return (
    <div className={`${cardStyles[template]} animate-pulse`}>
      <div className="aspect-square bg-muted" />
      <div className="p-5">
        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    </div>
  )
}
