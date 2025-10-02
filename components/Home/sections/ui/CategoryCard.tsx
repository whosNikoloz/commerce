import Link from "next/link";
import Image from "next/image";
import { CategoryModel } from "@/types/category";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: CategoryModel;
  imageUrl?: string;
  productCount?: number;
  template?: 1 | 2 | 3;
  className?: string;
}

export function CategoryCard({
  category,
  imageUrl = "/placeholder.svg",
  productCount,
  template = 1,
  className = ""
}: CategoryCardProps) {
  const href = `/category/${category.id}`;

  // Template-specific styles
  const cardStyles = {
    1: "group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-brand-primary/20 transition-all duration-500 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 hover:border-brand-primary/50 hover:scale-[1.02]",
    2: "group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-700 bg-card border-2 border-border",
    3: "group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-card border-2 border-border hover:border-brand-primary"
  };

  const overlayStyles = {
    1: "absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-purple-600/5 to-transparent group-hover:from-brand-primary/20 transition-all duration-500",
    2: "absolute inset-0 bg-gradient-to-br from-black/70 via-transparent to-black/40 group-hover:from-black/80 transition-colors duration-500",
    3: "absolute inset-0 bg-gradient-to-t from-brand-primarydark/90 via-transparent to-transparent group-hover:from-brand-primarydark transition-colors duration-300"
  };

  return (
    <Link href={href} className={`${cardStyles[template]} ${className}`}>
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={imageUrl}
          alt={category.name || "Category"}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className={overlayStyles[template]} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent transform group-hover:translate-y-[-4px] transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1.5 text-white text-balance group-hover:text-brand-primary transition-colors">
              {category.name}
            </h3>
            {productCount !== undefined && (
              <p className="text-sm text-slate-300 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                {productCount} products
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-primary/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300">
            <ArrowRight className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CategoryCardSkeleton({ template = 1 }: { template?: 1 | 2 | 3 }) {
  const cardStyles = {
    1: "rounded-2xl overflow-hidden bg-card border border-border",
    2: "rounded-3xl overflow-hidden bg-card border-2 border-border",
    3: "rounded-xl overflow-hidden bg-card border-2 border-border"
  };

  return (
    <div className={`${cardStyles[template]} animate-pulse`}>
      <div className="aspect-square bg-muted" />
      <div className="p-5">
        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}
