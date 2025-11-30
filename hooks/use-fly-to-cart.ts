"use client";
import { useCallback } from "react";

import { useCartUI } from "@/app/context/cart-ui";
import { useTenant } from "@/app/context/tenantContext";
import { useIsMobile } from "@/hooks/use-mobile";

type Options = {
  durationMs?: number;
  rotateDeg?: number;
  scaleTo?: number;
  curve?: number;
};

export function useFlyToCart(options?: Options) {
  const { cartIconRef, footerCartRef, bottomNavCartRef, bumpCartBadge } = useCartUI();
  const { config } = useTenant();
  const isMobile = useIsMobile();

  const flyToCart = useCallback(async (imgEl: HTMLImageElement | null) => {
    // Check if fly-to-cart is enabled in tenant config (default: true)
    const isEnabled = config?.ui?.enableFlyToCart ?? true;

    if (!isEnabled) {
      // Just bump the badge without animation
      bumpCartBadge();
      return;
    }

    // Determine which cart to fly to based on screen size and cart visibility
    let targetCart = cartIconRef.current;

    // Priority 1: Check if footer product cart is visible (works on both mobile and desktop)
    if (footerCartRef.current) {
      const rect = footerCartRef.current.getBoundingClientRect();
      const isVisible =
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth &&
        rect.width > 0 &&
        rect.height > 0;

      if (isVisible) {
        targetCart = footerCartRef.current;
      }
    }
    // Priority 2: If no footer cart, choose based on screen size
    else {
      // On mobile, use bottom nav cart if available
      if (isMobile && bottomNavCartRef.current) {
        targetCart = bottomNavCartRef.current;
      }
      // On desktop, use navbar cart (cartIconRef)
      else {
        targetCart = cartIconRef.current;
      }
    }

    if (!imgEl || !targetCart) return;

    const duration = options?.durationMs ?? 650;
    const rotateDeg = options?.rotateDeg ?? 360;
    const scaleTo = options?.scaleTo ?? 0.25;
    const curve = options?.curve ?? 0.3;

    // Get positions in viewport coordinates (getBoundingClientRect already accounts for scroll)
    const sourceRect = imgEl.getBoundingClientRect();
    const targetRect = targetCart.getBoundingClientRect();

    // Clone the image
    const clone = imgEl.cloneNode(true) as HTMLImageElement;

    // Use fixed positioning since both elements use viewport coordinates
    clone.style.position = "fixed";
    clone.style.left = `${sourceRect.left}px`;
    clone.style.top = `${sourceRect.top}px`;
    clone.style.width = `${sourceRect.width}px`;
    clone.style.height = `${sourceRect.height}px`;
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "9999";
    clone.style.margin = "0";
    clone.style.padding = "0";
    clone.style.objectFit = "cover";
    clone.style.borderRadius = "50%";
    clone.style.willChange = "transform, opacity";
    clone.style.transformOrigin = "center center";
    document.body.appendChild(clone);

    // Calculate center points
    const startX = sourceRect.left + sourceRect.width / 2;
    const startY = sourceRect.top + sourceRect.height / 2;
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    // Calculate the distance and direction
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Create a nice arc - control point calculation
    // Place control point perpendicular to the line between start and end
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Calculate perpendicular offset for the arc
    // Perpendicular vector: (-deltaY, deltaX)
    const perpX = -deltaY;
    const perpY = deltaX;
    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);

    // Normalize and scale by curve amount and distance
    const curveAmount = distance * curve;
    const cpX = midX + (perpX / perpLength) * curveAmount;
    const cpY = midY + (perpY / perpLength) * curveAmount;

    const startTime = performance.now();

    // Ease-in-out function for smooth animation
    const ease = (t: number) => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const elapsed = now - startTime;
        const rawT = Math.min(elapsed / duration, 1);
        const t = ease(rawT);

        // Quadratic Bezier curve: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
        const oneMinusT = 1 - t;
        const x = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * cpX + t * t * endX;
        const y = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * cpY + t * t * endY;

        // Scale down as it moves (start at 1, end at scaleTo)
        const curScale = 1 - (1 - scaleTo) * t;

        // Rotation
        const curRot = rotateDeg * t;

        // Stay visible throughout the animation
        const opacity = 1;

        // Apply transform from center of the cloned image
        clone.style.transform = `translate(${x - sourceRect.left - sourceRect.width / 2}px, ${y - sourceRect.top - sourceRect.height / 2}px) rotate(${curRot}deg) scale(${curScale})`;
        clone.style.opacity = `${opacity}`;

        if (rawT < 1) {
          requestAnimationFrame(step);
        } else {
          clone.remove();
          bumpCartBadge();
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  }, [cartIconRef, bumpCartBadge, options, config]);

  return { flyToCart };
}
