import { Badge } from "@heroui/badge";
import { ShoppingCartIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCartIconAnimation, AnimatedCount, CartIconBouncer } from "./cart-anim";

import { useCartStore } from "@/app/context/cartContext";

type HeaderCartButtonProps = {
  onClick?: () => void;
  className?: string;
};

export default function HeaderCartButton({ onClick, className }: HeaderCartButtonProps) {
  const total = useCartStore((s) => s.getCount());
  const { controls, animKey } = useCartIconAnimation(total);
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push("/cart");
    }
  };

  return (
    <Badge color="danger" content={<AnimatedCount animKey={animKey} value={total} />} size="sm">
      <button aria-label="Open cart" className={className} type="button" onClick={handleClick}>
        <CartIconBouncer controls={controls}>
          <ShoppingCartIcon size={24} />
        </CartIconBouncer>
      </button>
    </Badge>
  );
}
