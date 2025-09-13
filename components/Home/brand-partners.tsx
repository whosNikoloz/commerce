"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const brands = [
  { name: "Nike", logo: "/placeholder.png" },
  { name: "Apple", logo: "/placeholder.png" },
  { name: "Samsung", logo: "/placeholder.png" },
  { name: "Sony", logo: "/placeholder.png" },
  { name: "Adidas", logo: "/placeholder.png" },
  { name: "Microsoft", logo: "/placeholder.png" },
];

export function BrandPartners() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => setIsVisible(true), []);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-lightdark mb-4">
            Trusted by Leading Brands
          </h3>
          <p className="text-text-subtle dark:text-text-subtledark">
            We partner with the world&apos;s most innovative companies
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div
            className={`flex gap-12 items-center justify-center md:justify-between transition-opacity duration-1000 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {brands.map((brand, index) => (
              <div
                key={brand.name}
                className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: isVisible ? "fadeInUp 0.6s ease-out forwards" : "none",
                }}
              >
                <Image
                  alt={brand.name}
                  className="h-12 md:h-16 w-auto opacity-60 hover:opacity-100 transition-opacity"
                  height={64}
                  src={brand.logo || "/placeholder.png"}
                  width={160}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
