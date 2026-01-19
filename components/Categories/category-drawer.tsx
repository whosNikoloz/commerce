"use client";

import type { CategoryModel } from "@/types/category";

import { useMemo, useRef, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, ChevronRightIcon, ArrowLeftIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/button";

import { getAllCategories } from "@/app/api/services/categoryService";
import { useDictionary } from "@/app/context/dictionary-provider";

type ChildrenMap = Record<string, CategoryModel[]>;

const ROOT_KEY = "__root__";

function normalizeId(id?: string | null) {
  return (id ?? "").trim();
}

/** Build children map strictly by parentId; guard against cycles/missing parents. */
function buildTree(categories: CategoryModel[]) {
  const map: ChildrenMap = {};

  for (const c of categories) {
    const parent = normalizeId(c.parentId) || ROOT_KEY;

    if (!map[parent]) map[parent] = [];
    map[parent].push(c);
  }
  // stable sort by name (fallback to id)
  Object.keys(map).forEach((k) =>
    map[k].sort((a, b) => (a.name ?? a.id ?? "").localeCompare(b.name ?? b.id ?? ""))
  );
  const roots = map[ROOT_KEY] ?? [];

  return { childrenMap: map, roots };
}

export default function CategoryDrawer() {
  const dictionary = useDictionary();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Track current parent category (null = showing root categories)
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);

  const { childrenMap, roots } = useMemo(() => buildTree(categories), [categories]);
  const localeCode = pathname.startsWith("/en") ? "en" : "ka";

  const openDrawer = () => {
    setIsOpen(true);
    if (!hasLoadedRef.current) {
      void loadCategories();
    }
  };

  const closeDrawer = () => {
    setIsOpen(false);
    // Reset navigation when closing
    setCurrentParentId(null);
  };

  const navigateToCategory = (id: string) => {
    setCurrentParentId(id);
  };

  const goBack = () => {
    setCurrentParentId(null);
  };

  const getChildren = (id?: string | null) =>
    (id ? childrenMap[normalizeId(id)] : childrenMap[ROOT_KEY]) ?? [];

  const handleImageError = (categoryId: string) => {
    setImageErrors(prev => new Set(prev).add(categoryId));
  };

  // Get categories to display based on current navigation level
  const currentCategories = currentParentId
    ? getChildren(currentParentId)
    : roots;

  // Get current parent category for header display
  const currentParent = currentParentId
    ? categories.find(c => normalizeId(c.id) === currentParentId)
    : null;

  async function loadCategories() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCategories();

      setCategories(Array.isArray(data) ? data : []);
      hasLoadedRef.current = true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  /** Category row */
  function NodeRow({ node }: { node: CategoryModel }) {
    const id = normalizeId(node.id);
    const kids = getChildren(id);
    const hasChildren = kids.length > 0;
    const imageUrl = node.images && node.images.length > 0 ? node.images[0] : "/placeholder.png";
    const hasError = imageErrors.has(id);

    return (
      <li key={id} className="select-none">
        <div
          className={`group flex items-center gap-2 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all px-2 sm:px-4 min-w-0`}
        >
          <Link
            className="flex-1 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 min-w-0"
            href={`/${localeCode}/category/${id}`}
            onClick={closeDrawer}
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <Image
                fill
                alt={node.name || "Category"}
                className="object-cover"
                sizes="40px"
                src={hasError ? "/placeholder.png" : imageUrl}
                onError={() => handleImageError(id)}
              />
            </div>
            <span className="font-primary text-sm md:text-base font-medium text-gray-800 dark:text-gray-100 truncate min-w-0">
              {node.name ?? dictionary.categories?.category ?? "Category"}
            </span>
          </Link>

          {hasChildren ? (
            <button
              aria-label={dictionary.categories?.viewCategories}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0"
              type="button"
              onClick={() => navigateToCategory(id)}
            >
              <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-300" />
            </button>
          ) : (
            <></>
          )}
        </div>
      </li>
    );
  }

  return (
    <>
      <Button
        isIconOnly
        aria-label={dictionary.categories?.viewCategories}
        className="relative rounded-full bg-transparent h-6 w-6"
        variant="solid"
        onPress={openDrawer}
      >
        <Squares2X2Icon height={23} width={23}/>
      </Button>

      <Transition show={isOpen}>
        <Dialog className="relative z-50" onClose={closeDrawer}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div aria-hidden="true" className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" />
          </Transition.Child>

          {/* Panel */}
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="fixed left-0 top-0 h-full w-[420px] max-w-[92vw] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl rounded-r-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {currentParent ? (
                    <button
                      aria-label="Go back"
                      className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0"
                      type="button"
                      onClick={goBack}
                    >
                      <ArrowLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-300" />
                    </button>
                  ) : (
                    <Squares2X2Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                  <h2 className="font-heading text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white truncate min-w-0">
                    {currentParent ? currentParent.name : (dictionary.categories?.category ?? "Categories")}
                  </h2>
                </div>
                <button
                  aria-label="Close"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0"
                  onClick={closeDrawer}
                >
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5">
                {loading && (
                  <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-11 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
                      />
                    ))}
                  </div>
                )}

                {error && !loading && (
                  <div className="text-center py-10">
                    <p className="font-primary text-red-600 dark:text-red-400">{error}</p>
                    <Button className="mt-4" color="primary" variant="flat" onPress={loadCategories}>
                      {dictionary.common?.retry ?? "Try again"}
                    </Button>
                  </div>
                )}

                {!loading && !error && currentCategories.length === 0 && (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    {currentParent
                      ? dictionary.categories?.noSubcategories ?? "No subcategories available."
                      : dictionary.categories?.noCategories ?? "No categories available."}
                  </div>
                )}

                {!loading && !error && currentCategories.length > 0 && (
                  <ul className="space-y-1">
                    {currentCategories.map((category) => (
                      <NodeRow key={category.id} node={category} />
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 sm:p-5 border-t border-gray-200 dark:border-gray-700">
                <Button fullWidth as={Link} color="primary" href="/category" onPress={closeDrawer}>
                  {dictionary.categories?.allCategories ?? "View All Categories"}
                </Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
