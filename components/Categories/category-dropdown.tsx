"use client";

import type { CategoryModel } from "@/types/category";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { useDisclosure } from "@heroui/modal";
import { Squares2X2Icon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { getAllCategories } from "@/app/api/services/categoryService";

type ChildrenMap = Record<string, CategoryModel[]>;

export default function CategoryDropdown() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(false);

  // Hover state
  const [hoveredTop, setHoveredTop] = useState<string | null>(null);
  const [hoveredMid, setHoveredMid] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // Fetch once on first open
  useEffect(() => {
    if (!isOpen || hasLoadedRef.current) return;
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
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && e.target instanceof Node && !dropdownRef.current.contains(e.target)) {
        onClose();
        setHoveredTop(null);
        setHoveredMid(null);
      }
    };

    if (isOpen) document.addEventListener("mousedown", onDocClick);

    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        setHoveredTop(null);
        setHoveredMid(null);
      }
    };

    if (isOpen) document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleToggle = () => (isOpen ? onClose() : onOpen());

  // ---------- Build tree via parentId (no Map) ----------
  const { topLevel, childrenMap } = useMemo(() => {
    const ROOT = "__root__";
    const m: ChildrenMap = {};

    categories.forEach((c) => {
      const key = c.parentId && c.parentId.trim().length > 0 ? c.parentId.trim() : ROOT;

      if (!m[key]) m[key] = [];
      m[key].push(c);
    });

    Object.keys(m).forEach((k) => m[k].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")));

    return { topLevel: m[ROOT] ?? [], childrenMap: m };
  }, [categories]);

  const getChildren = (parentId?: string | null) =>
    (parentId ? childrenMap[parentId] : undefined) ?? [];

  const hasChildren = (id: string) => (childrenMap[id]?.length ?? 0) > 0;

  // Lists for each column driven purely by hover state
  const midList = hoveredTop ? getChildren(hoveredTop) : [];
  const rightList = hoveredMid ? getChildren(hoveredMid) : [];

  // Dynamically size the card: 1/2/3 columns
  const colCount = 1 + (hoveredTop && midList.length > 0 ? 1 : 0) + (hoveredMid && rightList.length > 0 ? 1 : 0);
  const baseColWidth = 300; // px
  const cardWidth = Math.min(1000, colCount * baseColWidth + (colCount - 1) * 1); // add slight room for borders

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        isIconOnly
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="relative rounded-full bg-transparent"
        variant="light"
        onPress={handleToggle}
      >
        <Squares2X2Icon className="h-6 w-6" />
      </Button>

      <div
        className={`absolute left-0 top-14 transform transition-all duration-300 ease-out z-50
        ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-3 pointer-events-none"}`}
        style={{ width: cardWidth }}
      >
        <Card className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900">
          {/* Header */}
          <CardHeader className="pb-4 pt-6 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-lg font-bold text-text-light dark:text-text-lightdark">Categories</h1>
              <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-text-subtle dark:text-text-subtledark">
                {loading ? "Loading…" : `${categories.length} total`}
              </span>
            </div>
          </CardHeader>

          {/* Body */}
          <CardBody className="px-0 py-0">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : topLevel.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Squares2X2Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No top-level categories</p>
              </div>
            ) : (
              <div className="flex">
                {/* Column 1: Parents */}
                <div className="w-[300px] max-h-[60vh] overflow-y-auto border-r border-gray-200 dark:border-gray-800">
                  <div className="p-2">
                    {topLevel.map((c) => (
                      <div
                        key={c.id}
                        onMouseEnter={() => {
                          setHoveredTop(c.id);
                          setHoveredMid(null); // reset mid when changing parent
                        }}
                      >
                        <Link
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors
                            ${
                              hoveredTop === c.id
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                            }`}
                          href={`/category/${c.id}`}
                          onClick={() => {
                            onClose();
                            setHoveredTop(null);
                            setHoveredMid(null);
                          }}
                        >
                          <span className="text-sm font-medium truncate">{c.name ?? "Unnamed"}</span>
                          {hasChildren(c.id) && <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Children of hovered parent (only if exists) */}
                {hoveredTop && midList.length > 0 && (
                  <div className="w-[300px] max-h-[60vh] overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                    <div className="p-2">
                      {midList.map((child) => (
                        <div key={child.id} onMouseEnter={() => setHoveredMid(child.id)}>
                          <Link
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors
                              ${
                                hoveredMid === child.id
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                            href={`/category/${child.id}`}
                            onClick={() => {
                              onClose();
                              setHoveredTop(null);
                              setHoveredMid(null);
                            }}
                          >
                            <span className="text-sm font-medium truncate">{child.name ?? "Subcategory"}</span>
                            {hasChildren(child.id) && <ChevronRightIcon className="h-4 w-4" />}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Column 3: Grandchildren of hovered child (only if exists) */}
                {hoveredMid && rightList.length > 0 && (
                  <div className="w-[300px] max-h-[60vh] overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
                    <div className="p-2">
                      {rightList.map((g) => (
                        <Link
                          key={g.id}
                          className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors group"
                          href={`/category/${g.id}`}
                          onClick={() => {
                            onClose();
                            setHoveredTop(null);
                            setHoveredMid(null);
                          }}
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {g.name ?? "Category"}
                          </span>
                          {hasChildren(g.id) && <ChevronRightIcon className="h-4 w-4 opacity-70" />}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardBody>

          {/* Footer */}
          <CardFooter className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="w-full flex gap-3">
              <Button
                as={Link}
                className="flex-1 h-11 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-text-light dark:text-text-lightdark hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                href="/category"
                variant="bordered"
                onPress={onClose}
              >
                View all
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
