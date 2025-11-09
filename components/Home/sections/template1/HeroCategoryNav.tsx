"use client";

import type { CategoryModel } from "@/types/category";
import type { Locale } from "@/types/tenant";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

const CLOSE_DELAY = 0; // instant close
const GAP_PX = 16;
const MARGIN_PX = 8;
const PANEL_W = 360;

export default function HeroCategoryNav({ categories, locale, title }: HeroCategoryNavProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; maxH: number } | null>(null);

  const [overItemWithSubs, setOverItemWithSubs] = useState(false);
  const [overPanel, setOverPanel] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const closeNow = () => {
    cancelClose();
    setHoveredCategory(null);
    setPanelPos(null);
    setOverItemWithSubs(false);
    setOverPanel(false);
  };

  const maybeScheduleClose = () => {
    cancelClose();
    if (overItemWithSubs || overPanel) return;
    closeTimeoutRef.current = setTimeout(() => {
      if (!overItemWithSubs && !overPanel) closeNow();
    }, CLOSE_DELAY);
  };

  const computePanelPosition = () => {
    const cardRect = cardRef.current?.getBoundingClientRect();

    if (!cardRect) return null;

    const viewH = window.innerHeight;
    let top = Math.max(MARGIN_PX, Math.min(cardRect.top, viewH - MARGIN_PX));
    let left = Math.min(cardRect.right + GAP_PX, window.innerWidth - MARGIN_PX - PANEL_W);

    const cardMaxH = cardRect.height;
    const viewMaxH = viewH - MARGIN_PX * 2;
    const maxH = Math.max(220, Math.min(cardMaxH, viewMaxH));

    return { top, left, maxH };
  };

  const openForCategory = (categoryId: string) => {
    setHoveredCategory(categoryId);
    const pos = computePanelPosition();

    if (pos) setPanelPos(pos);
  };

  // ESC closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNow();
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Outside click closes
  useEffect(() => {
    if (!hoveredCategory) return;
    const onDocDown = (e: MouseEvent) => {
      const card = cardRef.current;
      const panel = panelRef.current;
      const t = e.target as Node;

      if (card?.contains(t) || panel?.contains(t)) return;
      closeNow();
    };

    document.addEventListener("mousedown", onDocDown);

    return () => document.removeEventListener("mousedown", onDocDown);
  }, [hoveredCategory]);

  // Close on any window/page scroll, any wheel, or touchmove (even if over panel)
  useEffect(() => {
    if (!hoveredCategory) return;
    const onScroll = () => closeNow();
    const onWheel = () => closeNow();
    const onTouchMove = () => closeNow();

    // Use capture so it fires even if inner elements handle the event first
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // Keep panel aligned on resize (but still close on scroll/wheel)
    const onResize = () => {
      const pos = computePanelPosition();

      if (pos) setPanelPos(pos);
    };

    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true } as any);
      window.removeEventListener("wheel", onWheel as EventListener);
      window.removeEventListener("touchmove", onTouchMove as EventListener);
      window.removeEventListener("resize", onResize);
    };
  }, [hoveredCategory]);

  // Mobile: tap to toggle subs
  const onItemTouch = (hasSubs: boolean, id: string, e: React.TouchEvent) => {
    if (!hasSubs) return;
    e.preventDefault();
    if (hoveredCategory === id) {
      closeNow();
    } else {
      setOverItemWithSubs(true);
      openForCategory(id);
    }
  };

  return (
    <div className="relative">
      {/* LEFT CARD */}
      <div
        ref={cardRef}
        className="relative rounded-xl shadow-lg border border-border overflow-hidden
                   bg-white dark:bg-neutral-900"
        onMouseLeave={() => { setOverItemWithSubs(false); maybeScheduleClose(); }}
      >
        <div className="px-4 py-3 border-b border-border bg-neutral-100 dark:bg-neutral-800">
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
                    className="relative select-none"
                    onMouseEnter={() => {
                      if (hasSubs) {
                        setOverItemWithSubs(true);
                        openForCategory(category.id);
                      } else {
                        setOverItemWithSubs(false);
                        closeNow();
                      }
                    }}
                    onMouseLeave={() => {
                      if (hasSubs) {
                        setOverItemWithSubs(false);
                        maybeScheduleClose();
                      }
                    }}
                    onTouchStart={(e) => onItemTouch(hasSubs, category.id, e)}
                  >
                    <Link
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                      href={`/${locale}/category/${category.id}`}
                    >
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {category.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* {hasSubs && (
                          <span className="text-xs text-primary/70 font-medium">
                            +{subcategories!.length}
                          </span>
                        )} */}
                        {/* <span className="text-xs text-muted-foreground/70">{productCount}</span> */}
                        {hasSubs && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              No categories available
            </div>
          )}
        </nav>
      </div>

      {/* RIGHT FIXED PANEL */}
      {hoveredCategory && panelPos && (() => {
        const data = categories.find((c) => c.category.id === hoveredCategory);
        const subs = data?.subcategories ?? [];

        if (!subs.length) return null;

        return (
          <nav
            ref={panelRef}
            aria-label={`${data?.category.name} subcategories`}
            className="fixed z-50 w-[360px] rounded-xl shadow-2xl border border-border overflow-hidden
                       bg-white dark:bg-neutral-900"
            role="navigation"
            style={{ top: panelPos.top, left: panelPos.left, maxHeight: panelPos.maxH }}
            onMouseEnter={() => { setOverPanel(true); cancelClose(); }}
            onMouseLeave={() => { setOverPanel(false); maybeScheduleClose(); }}
          >
            <div className="px-4 py-3 border-b border-border bg-neutral-50 dark:bg-neutral-800">
              <h3 className="font-semibold text-sm text-foreground">{data?.category.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{subs.length} subcategories</p>
            </div>

            {/* Close when the list itself scrolls */}
            <div
              className="py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
              onScroll={closeNow}
            >
              <ul className="space-y-0.5" role="menu">
                {subs.map((subcategory) => (
                  <li key={subcategory.id} role="none">
                    <Link
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                      href={`/${locale}/category/${subcategory.id}`}
                      role="menuitem"
                      onClick={closeNow}
                    >
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {subcategory.name}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-all" />
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
