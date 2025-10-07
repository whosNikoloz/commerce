"use client";

import type { CategoryModel } from "@/types/category";

import { useState, Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, Squares2X2Icon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@heroui/button";

import { getAllCategories } from "@/app/api/services/categoryService";

type ChildrenMap = Record<string, CategoryModel[]>;

export default function CategoryDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeDrawer = () => setIsOpen(false);
  const openDrawer = () => {
    setIsOpen(true);
    if (categories.length === 0) {
      void loadCategories();
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCategories();

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ----- Build tree via parentId (no Map to avoid TS target issues) -----
  const { roots, childrenMap } = useMemo(() => {
    const ROOT = "__root__";
    const m: ChildrenMap = {};

    for (const c of categories) {
      const key = c.parentId && c.parentId.trim().length > 0 ? c.parentId.trim() : ROOT;

      if (!m[key]) m[key] = [];
      m[key].push(c);
    }
    // sort buckets by name for stable ordering
    Object.keys(m).forEach((k) => m[k].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")));

    return { roots: m[ROOT] ?? [], childrenMap: m };
  }, [categories]);

  const getChildren = (parentId?: string | null) =>
    (parentId ? childrenMap[parentId] : undefined) ?? [];

  const hasChildren = (id: string) => (childrenMap[id]?.length ?? 0) > 0;

  // ----- Recursive renderer for unlimited nesting -----
  const renderNode = (node: CategoryModel, level = 0) => {
    const kids = getChildren(node.id);
    const padLeft = Math.min(24 + level * 14, 48); // gentle indent, capped

    return (
      <li key={node.id}>
        <Link
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group"
          href={`/category/${node.id}`}
          style={{ paddingLeft: padLeft }}
          onClick={closeDrawer}
        >
          <span className="text-sm md:text-base font-medium text-gray-800 dark:text-white truncate">
            {node.name ?? "Category"}
          </span>
          {hasChildren(node.id) && (
            <ChevronRightIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
          )}
        </Link>

        {kids.length > 0 && (
          <ul className="mt-2 space-y-1">
            {kids.map((k) => renderNode(k, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      <Button
        isIconOnly
        className="relative rounded-full bg-transparent h-6 w-6"
        variant="solid"
        onPress={openDrawer}
      >
        <Squares2X2Icon height={23} width={23}/>
      </Button>

      <Transition show={isOpen}>
        <Dialog className="relative z-50" onClose={closeDrawer}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-sm"
            leave="transition-opacity ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-sm"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div aria-hidden="true" className="fixed inset-0 bg-black/40 dark:bg-black/60" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition-transform ease-in-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="fixed left-0 top-0 h-full w-96 max-w-full bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-2xl rounded-r-xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">📂 Categories</h2>
                <button className="hover:rotate-90 transition-transform" onClick={closeDrawer}>
                  <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Body */}
              {loading ? (
                <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 dark:border-white" />
                  <p className="mt-4 text-gray-600 dark:text-gray-300">Loading categories...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  <Button className="mt-4" color="primary" variant="flat" onPress={loadCategories}>
                    Try Again
                  </Button>
                </div>
              ) : roots.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                  <Squares2X2Icon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                  <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">No categories available.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6">
                  <ul className="space-y-2">
                    {roots.map((root) => renderNode(root, 0))}
                  </ul>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
