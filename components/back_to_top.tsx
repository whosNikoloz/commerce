"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowUp } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";

type Props = {
  threshold?: number;
  className?: string;
  offsetClass?: string; // e.g. "bottom-6 right-6"
  ariaLabel?: string;
};

export default function BackToTopShadcn({
  threshold = 300,
  className,
  offsetClass = "bottom-16 right-6 md:bottom-8 md:right-8",
  ariaLabel = "Back to top",
}: Props) {
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "matchMedia" in window) {
      prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > threshold);
        ticking.current = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    if (prefersReducedMotion.current) window.scrollTo(0, 0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Button
      aria-label={ariaLabel}
      className={clsx(
        "fixed z-50 rounded-full h-11 w-11 md:h-12 md:w-12",
        "shadow-lg bg-primary text-primary-foreground",
        "hover:brightness-95 active:brightness-90",
        "focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
        "transition-opacity duration-200",
        offsetClass,
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        className,
      )}
      size="icon"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      type="button"
      onClick={scrollToTop}
    >
      <span className="sr-only">{ariaLabel}</span>
      <ArrowUp className="h-5 w-5 md:h-6 md:w-6" />
    </Button>
  );
}
