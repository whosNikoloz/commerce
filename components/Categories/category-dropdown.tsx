"use client";

import type { CategoryModel } from "@/types/category";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronRight, X, Boxes } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Squares2X2Icon } from "@heroicons/react/24/outline";

import { getAllCategories } from "@/app/api/services/categoryService";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/app/context/dictionary-provider";

type ChildrenMap = Record<string, CategoryModel[]>;

function PortalWrapper({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;

  return createPortal(children, document.body);
}

export default function CategoryDropdown() {
  const dictionary = useDictionary();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const hasLoadedRef = React.useRef(false);
  const pathname = usePathname();
  const localeCode = pathname.startsWith("/en") ? "en" : "ka";

  // Fetch categories once on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;

    (async () => {
      try {
        setLoading(true);
        const data = await getAllCategories();

        setCategories(Array.isArray(data) ? data : []);
        hasLoadedRef.current = true;
      } catch (e) {
        console.error("Failed to load categories", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Scroll lock – prevent page scrolling when dropdown is open
  useEffect(() => {
    if (!isOpen) return;

    // Lock both html and body to prevent any scrolling
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyWidth = document.body.style.width;
    const scrollY = window.scrollY;

    // Completely prevent scrolling
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      // Restore original state
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = "";
      document.body.style.width = originalBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Build tree (parent/children)
  const { topLevel, childrenMap } = useMemo(() => {
    const ROOT = "__root__";
    const m: ChildrenMap = {};

    categories.forEach((c) => {
      const key =
        c.parentId && c.parentId.trim().length > 0
          ? c.parentId.trim()
          : ROOT;

      if (!m[key]) m[key] = [];
      m[key].push(c);
    });

    Object.keys(m).forEach((k) =>
      m[k].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
    );

    return { topLevel: m[ROOT] ?? [], childrenMap: m };
  }, [categories]);

  // Parents into rows
  const categoryRows = useMemo(() => {
    const rows: CategoryModel[][] = [];
    const COLUMNS = 4; // ცოტა ნაკლები, რომ ჰორიზონტალური ბარათები სუნთქავდეს

    for (let i = 0; i < topLevel.length; i += COLUMNS) {
      rows.push(topLevel.slice(i, i + COLUMNS));
    }

    return rows;
  }, [topLevel]);

  const toggleCategory = (id: string) => {
    setActiveCategory((prev) => (prev === id ? null : id));
  };

  const activeCategoryData = activeCategory
    ? categories.find((c) => c.id === activeCategory)
    : null;
  const activeSubcategories = activeCategory
    ? childrenMap[activeCategory] || []
    : [];

  const getCategoryHref = (id: string) => `/${localeCode}/category/${id}`;

  // Parent card – ჰორიზონტალური: ტექსტი მარცხნივ, სურათი მარჯვნივ
  const renderParentCard = (cat: CategoryModel, isActive: boolean) => (
    <div className="flex items-center justify-between w-full gap-3">
      {/* Text side (left) */}
      <div className="flex flex-col items-start text-left flex-1">
        <span
          className={cn(
            "text-sm md:text-base font-semibold leading-tight line-clamp-2",
            isActive ? "text-primary" : "text-foreground"
          )}
        >
          {cat.name}
        </span>
        <span className="mt-1 text-[11px] md:text-xs text-muted-foreground flex items-center gap-1">
          {isActive ? (
            <>
              Viewing subcategories
              <ChevronRight className="w-3 h-3" />
            </>
          ) : (
            "Browse products"
          )}
        </span>
      </div>

      {/* Image side (right) */}
      <div className="flex items-center gap-2">
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 border border-border/60 flex items-center justify-center">
          {cat.images && cat.images[0] ? (
            <Image
              fill
              alt={cat.name || "Category"}
              className="object-cover"
              src={cat.images[0]}
            />
          ) : (
            <Boxes className="w-6 h-6 text-muted-foreground/60" />
          )}
        </div>
        <ChevronRight
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-300",
            isActive ? "rotate-90 text-primary" : "group-hover:translate-x-1"
          )}
        />
      </div>
    </div>
  );

  return (
    <div className="">
      {/* Trigger Button */}
      <button
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm relative z-[10001]",
          isOpen
            ? ""
            : ""
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <></> : <Squares2X2Icon className="w-5 h-5" />}
      </button>

      {/* FULLSCREEN overlay via portal */}
      <AnimatePresence>
        {isOpen && (
          <PortalWrapper>
            <>
              {/* Backdrop */}
              <motion.div
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/50 z-[10000] backdrop-blur-sm"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
              />

              {/* Main panel – with inside scrolling only */}
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="fixed inset-0 z-[10000] flex items-start justify-center pt-28 md:pt-32 pb-4 px-2 md:px-6 pointer-events-none"
                exit={{ opacity: 0, y: 12 }}
                initial={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {/* Card container – scrolls inside only */}
                <div className="relative w-full max-w-6xl rounded-3xl bg-white dark:bg-neutral-900 shadow-[0_24px_80px_rgba(0,0,0,0.4)] border border-primary/40 backdrop-blur-xl overflow-hidden max-h-full flex flex-col pointer-events-auto">
                  {/* Header row */}
                  <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border/60 bg-gradient-to-r from-primary/5 via-neutral-50/70 to-transparent dark:from-primary/10 dark:via-neutral-900/80">
                    <h2 className="text-base md:text-lg font-semibold" >{dictionary?.categories?.allCategories || "All Categories"}</h2>
                    <button
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs md:text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body – scrolls INSIDE card only (like veli.store) */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 py-4 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                    {loading ? (
                      <div className="p-8 text-center text-muted-foreground">
                        Loading categories...
                      </div>
                    ) : topLevel.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No categories found.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-8">
                        {categoryRows.map((row, rowIndex) => {
                          const isRowActive = row.some(
                            (cat) => cat.id === activeCategory
                          );

                          return (
                            <div key={rowIndex} className="flex flex-col gap-2">
                              {/* Parent category cards */}
                              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                                {row.map((cat) => {
                                  const hasChildren =
                                    (childrenMap[cat.id]?.length || 0) > 0;
                                  const isActive = activeCategory === cat.id;

                                  // No subcategories → direct link card
                                  if (!hasChildren) {
                                    return (
                                      <Link
                                        key={cat.id}
                                        className={cn(
                                          "group flex items-stretch p-3 rounded-2xl transition-all border text-left",
                                          "bg-neutral-50 dark:bg-neutral-900/80 border-border/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-primary/60 hover:shadow-md"
                                        )}
                                        href={getCategoryHref(cat.id)}
                                        onClick={() => setIsOpen(false)}
                                      >
                                        {renderParentCard(cat, false)}
                                      </Link>
                                    );
                                  }

                                  // Has subcategories → toggle dropdown
                                  return (
                                    <button
                                      key={cat.id}
                                      className={cn(
                                        "group flex items-stretch p-3 rounded-2xl transition-all border text-left",
                                        isActive
                                          ? "bg-primary/5 border-primary shadow-md shadow-primary/30"
                                          : "bg-neutral-50 dark:bg-neutral-900/80 border-border/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-primary/60 hover:shadow-md"
                                      )}
                                      onClick={() => toggleCategory(cat.id)}
                                    >
                                      {renderParentCard(cat, isActive)}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Subcategories panel just under that row */}
                              <AnimatePresence>
                                {isRowActive &&
                                  activeCategoryData &&
                                  activeSubcategories.length > 0 && (
                                    <motion.div
                                      animate={{ height: "auto", opacity: 1 }}
                                      className="overflow-hidden w-full"
                                      exit={{ height: 0, opacity: 0 }}
                                      initial={{ height: 0, opacity: 0 }}
                                      transition={{
                                        duration: 0.28,
                                        ease: "easeInOut",
                                      }}
                                    >
                                      <div className="mt-2 mb-6 rounded-2xl border border-border bg-neutral-50/90 dark:bg-neutral-900/80 p-3 md:p-4">
                                        {/* Smaller subcategory rows */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                                          {activeSubcategories.map((sub) => (
                                            <Link
                                              key={sub.id}
                                              className="group flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-white dark:hover:bg-neutral-800 transition-all border border-border/50 hover:border-primary/50"
                                              href={getCategoryHref(sub.id)}
                                              onClick={() => setIsOpen(false)}
                                            >
                                              {/* Left: smaller name */}
                                              <span className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-foreground text-left line-clamp-2">
                                                {sub.name}
                                              </span>

                                              {/* Right: small icon (sub style) */}
                                              <div className="flex items-center gap-1">
                                                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-border/50 flex items-center justify-center overflow-hidden">
                                                  {sub.images && sub.images[0] ? (
                                                    <Image
                                                      fill
                                                      alt={sub.name || "Category"}
                                                      className="object-cover"
                                                      src={sub.images[0]}
                                                    />
                                                  ) : (
                                                    <Boxes className="w-4 h-4 text-muted-foreground/70" />
                                                  )}
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                                              </div>
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          </PortalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
