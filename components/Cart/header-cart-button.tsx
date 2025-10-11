"use client";

import { Badge } from "@heroui/badge";
import { ShoppingCartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@heroui/button";

import { useCartIconAnimation, AnimatedCount, CartIconBouncer } from "./cart-anim";

import { useCartStore } from "@/app/context/cartContext";

type HeaderCartButtonProps = {
  onClick?: () => void;
  className?: string;
};

// tiny helper
function useHasMounted() {
  const [m, setM] = useState(false);

  useEffect(() => setM(true), []);

  return m;
}

export default function HeaderCartButton({ onClick, className }: HeaderCartButtonProps) {
  const total = useCartStore((s) => s.getCount());
  const { controls, animKey } = useCartIconAnimation(total);
  const router = useRouter();
  const mounted = useHasMounted();

  const handleClick = () => {
    if (onClick) onClick();
    else router.push("/cart");
  };

  return (
    <Badge
      color="danger"
      /* render nothing on the server, real count after mount */
      content={
        mounted ? (
          <AnimatedCount animKey={animKey} value={total} />
        ) : null
      }
      size="sm"
    >
      <Button
        isIconOnly
        aria-expanded={false}
        aria-label="Open cart"
        className={className}
        onPress={handleClick}
      >
        <CartIconBouncer controls={controls}>
          <ShoppingCartIcon size={24} />
        </CartIconBouncer>
      </Button>
    </Badge>
  );
}
