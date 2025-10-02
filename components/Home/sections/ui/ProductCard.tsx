import Link from "next/link";
import Image from "next/image";
import { ProductResponseModel } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { StockStatus } from "@/types/enums";

interface ProductCardProps {
  product: ProductResponseModel;
  template?: 1 | 2 | 3;
  className?: string;
}

export function ProductCard({ product, template = 1, className = "" }: ProductCardProps) {
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const imageUrl = product.images?.[0] || "/placeholder.svg";
  const isInStock = product.status === StockStatus.InStock;

  // Template-specific styles
  const cardStyles = {
    1: "bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl hover:shadow-2xl hover:shadow-brand-primary/10 hover:border-brand-primary/50 transition-all duration-500 hover:scale-[1.02]",
    2: "bg-card border border-border rounded-3xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500",
    3: "bg-card border-2 border-border rounded-xl hover:shadow-lg hover:border-brand-primary transition-all duration-300"
  };

  const imageWrapperStyles = {
    1: "rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 ring-1 ring-white/10",
    2: "rounded-2xl bg-gradient-to-br from-brand-50 to-muted",
    3: "rounded-lg bg-muted/50"
  };

  return (
    <Link href={`/product/${product.id}`} className={`group block ${cardStyles[template]} ${className}`}>
      <div className="p-4">
        {/* Image */}
        <div className={`relative aspect-square mb-4 overflow-hidden ${imageWrapperStyles[template]}`}>
          <Image
            src={imageUrl}
            alt={product.name || "Product"}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNewArrival && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold shadow-lg border-0">NEW</Badge>
            )}
            {discountPercent > 0 && (
              <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold shadow-lg border-0">-{discountPercent}%</Badge>
            )}
            {!isInStock && (
              <Badge variant="secondary" className="bg-slate-800/90 text-white backdrop-blur-sm">Out of Stock</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Brand */}
          {product.brand?.name && (
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">
              {product.brand.name}
            </p>
          )}

          {/* Name */}
          <h3 className="font-bold text-white line-clamp-2 group-hover:text-brand-primary transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2.5 pt-1">
            {product.discountPrice ? (
              <>
                <span className="text-2xl font-black bg-gradient-to-r from-brand-primary to-purple-500 bg-clip-text text-transparent">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-sm text-slate-500 line-through font-medium">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-black text-white">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton({ template = 1 }: { template?: 1 | 2 | 3 }) {
  const cardStyles = {
    1: "bg-card border border-border rounded-2xl",
    2: "bg-card border border-border rounded-3xl",
    3: "bg-card border-2 border-border rounded-xl"
  };

  return (
    <div className={`${cardStyles[template]} p-4 animate-pulse`}>
      <div className="aspect-square bg-muted rounded-xl mb-4" />
      <div className="space-y-3">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-6 bg-muted rounded w-24 mt-3" />
      </div>
    </div>
  );
}
