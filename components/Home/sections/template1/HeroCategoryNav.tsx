"use client";

import type { CategoryModel } from "@/types/category";
import type { Locale } from "@/types/tenant";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CategoryWithData {
  category: CategoryModel;
  productCount: number;
  subcategories?: CategoryModel[];
}
interface HeroCategoryNavProps {
  categories: CategoryWithData[];
  locale: Locale;
  title: string;
}

export default function HeroCategoryNav({ categories, locale, title }: HeroCategoryNavProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);

  // Track whether the mouse is over the card or the panel
  const [overCard, setOverCard] = useState(false);
  const [overPanel, setOverPanel] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper: cancel any pending close
  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  // Close with a small grace only when pointer is in neither area
  const maybeScheduleClose = () => {
    cancelClose();
    if (overCard || overPanel) return; // still inside either zone → keep open
    closeTimeoutRef.current = setTimeout(() => {
      if (!overCard && !overPanel) {
        setHoveredCategory(null);
        setPanelPos(null);
      }
    }, 220);
  };

  useEffect(() => {
    // ESC closes immediately
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancelClose();
        setHoveredCategory(null);
        setPanelPos(null);
      }
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Global auto-dismiss on scroll/resize/blur
  useEffect(() => {
    if (!hoveredCategory) return;
    const closeNow = () => {
      cancelClose();
      setHoveredCategory(null);
      setPanelPos(null);
    };
    const onScroll = closeNow;
    const onResize = closeNow;
    const onBlur = closeNow;

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("blur", onBlur);
    };
  }, [hoveredCategory]);

  useEffect(() => {
    return () => cancelClose();
  }, []);

  const handleMouseEnterItem = (categoryId: string, e: React.MouseEvent<HTMLLIElement>) => {
    cancelClose();
    setHoveredCategory(categoryId);

    const itemRect = e.currentTarget.getBoundingClientRect();
    const cardRect = cardRef.current?.getBoundingClientRect();
    const panelWidth = 320;
    const panelMaxH = 400;
    const gap = 16;
    const margin = 8;

    let top = itemRect.top;

    top = Math.max(margin, Math.min(top, window.innerHeight - margin - panelMaxH));

    let left = (cardRect?.right ?? itemRect.right) + gap;

    left = Math.min(left, window.innerWidth - margin - panelWidth);

    setPanelPos({ top, left });
  };

  return (
    <div className="relative">
      <div
        ref={cardRef}
        className="bg-card rounded-xl shadow-lg border border-border overflow-hidden relative"
        onMouseEnter={() => { setOverCard(true); cancelClose(); }}
        onMouseLeave={() => { setOverCard(false); maybeScheduleClose(); }}
      >
        <div className="bg-primary/10 px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-lg text-foreground">{title}</h2>
        </div>

        <nav className="py-2">
          {categories?.length ? (
            <ul className="space-y-0.5">
              {categories.map(({ category, productCount, subcategories }) => {
                const hasSubs = !!subcategories?.length;

                return (
                  <li
                    key={category.id}
                    className="relative"
                    onMouseEnter={(e) => {
                      if (hasSubs) handleMouseEnterItem(category.id, e);
                      else setHoveredCategory(null);
                    }}
                    // NOTE: no onMouseLeave here; we handle at card/panel level to avoid flicker
                  >
                    <Link
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors group"
                      href={`/${locale}/category/${category.id}`}
                    >
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {category.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {hasSubs && <span className="text-xs text-primary/60 font-medium">+{subcategories!.length}</span>}
                        <span className="text-xs text-muted-foreground/60">{productCount}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">No categories available</div>
          )}
        </nav>
      </div>

      {/* Right-side subcategory panel (no backdrop) */}
      {hoveredCategory && panelPos && (() => {
        const data = categories.find((c) => c.category.id === hoveredCategory);
        const subs = data?.subcategories ?? [];

        if (!subs.length) return null;

        return (
          <nav
            aria-label={`${data?.category.name} subcategories`}
            className="fixed z-50 w-80 max-h-[400px] bg-card rounded-xl shadow-2xl border border-border overflow-hidden"
            role="navigation"
            style={{ top: panelPos.top, left: panelPos.left }}
            onMouseEnter={() => { setOverPanel(true); cancelClose(); }}
            onMouseLeave={() => { setOverPanel(false); maybeScheduleClose(); }}
          >
            <div className="bg-primary/5 px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">{data?.category.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{subs.length} subcategories</p>
            </div>
            <div className="py-2 max-h-[352px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              <ul className="space-y-0.5" role="menu">
                {subs.map((subcategory) => (
                  <li key={subcategory.id} role="none">
                    <Link
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors group"
                      href={`/${locale}/category/${subcategory.id}`}
                      role="menuitem"
                      onClick={() => {
                        cancelClose();
                        setHoveredCategory(null);
                        setPanelPos(null);
                      }}
                    >
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {subcategory.name}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        );
      })()}
    </div>
  );
}
