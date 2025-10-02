import Link from "next/link";
import Image from "next/image";
import { BrandModel } from "@/types/brand";

interface BrandCardProps {
  brand: BrandModel;
  logoUrl?: string;
  template?: 1 | 2 | 3;
  className?: string;
}

export function BrandCard({
  brand,
  logoUrl = "/placeholder.svg",
  template = 1,
  className = ""
}: BrandCardProps) {
  const href = `/brands/${brand.id}`;

  // Template-specific styles
  const wrapperStyles = {
    1: "relative h-16 md:h-20 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-500 hover:scale-110",
    2: "relative h-20 md:h-24 opacity-60 hover:opacity-100 transition-all duration-700 hover:scale-105 filter hover:drop-shadow-lg",
    3: "relative h-16 md:h-20 grayscale-[50%] hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-500 hover:scale-110"
  };

  return (
    <Link href={href} className={`block group ${className}`}>
      <div className={wrapperStyles[template]}>
        <Image
          src={logoUrl}
          alt={brand.name || "Brand"}
          fill
          className="object-contain"
          sizes="200px"
        />
      </div>
    </Link>
  );
}

export function BrandCardSkeleton({ template = 1 }: { template?: 1 | 2 | 3 }) {
  const wrapperStyles = {
    1: "h-16 md:h-20",
    2: "h-20 md:h-24",
    3: "h-16 md:h-20"
  };

  return (
    <div className={`${wrapperStyles[template]} bg-muted rounded animate-pulse`} />
  );
}
