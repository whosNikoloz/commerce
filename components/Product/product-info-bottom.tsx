import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface ProductInfoBottomProps {
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  isVisible: boolean;
  freeShipping?: boolean;
}

export function ProductInfoBottom({
  name,
  price,
  originalPrice,
  discount,
  isVisible,
  freeShipping = true,
}: ProductInfoBottomProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-14 md:bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 shadow-lg px-4 py-3 transform transition-all duration-300 z-50 ease-in-out ${
        isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <Image
            alt={name}
            className="rounded-lg h-12 w-12 md:h-16 md:w-16 object-cover"
            height={64}
            src="/img1.jpg"
            width={64}
          />
          <div className="flex-col md:block hidden">
            <span className="text-sm md:text-lg font-semibold truncate max-w-[120px] md:max-w-xs">
              {name}
            </span>
            {freeShipping && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                უფასო მიწოდება
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-baseline gap-1 md:gap-2">
            <span className="text-base md:text-2xl font-bold">
              {price.toFixed(2)} ₾
            </span>
            {originalPrice && (
              <span className="text-xs md:text-base text-gray-500 line-through">
                {originalPrice.toFixed(2)} ₾
              </span>
            )}
            {discount && (
              <Badge className="ml-1 text-xs bg-red-500 text-white">
                -{discount}%
              </Badge>
            )}
          </div>
          <Button className="h-10 px-3 md:px-4 ml-2 md:ml-4 flex items-center gap-1 md:gap-2 bg-black text-white">
            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden xs:inline">ყიდვა</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
