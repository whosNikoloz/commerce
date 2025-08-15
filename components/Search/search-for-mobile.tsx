"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@headlessui/react";
import { motion } from "framer-motion";

import { HomeIcon, ProfileIcon, SearchIcon } from "../icons";
import Cartlink from "../Cart/cart-link";
import { GoBackButton } from "../go-back-button";

import { searchProducts } from "@/app/api/services/productService";
import { getAllCategories } from "@/app/api/services/categoryService"; // NEW
import type { CategoryModel } from "@/types/category"; // NEW
import type { ProductResponseModel } from "@/types/product";
import type { PagedList } from "@/types/pagination";

// ---- NEW: helper type, same जैसा SearchPage ----
type CategoryWithSubs = CategoryModel & { subcategories?: CategoryModel[] };

interface SearchForMobileProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSearchModalOpen: (isOpen: boolean) => void;
  isModalOpen: boolean;
  forBottomNav?: boolean;
}

type SearchResult = Pick<ProductResponseModel, "id" | "name" | "images" | "price">;

export default function SearchForMobile({
  searchQuery,
  setSearchQuery,
  isModalOpen,
  setSearchModalOpen,
  forBottomNav = false,
}: SearchForMobileProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---- NEW: categories state ----
  const [root, setRoot] = useState<CategoryWithSubs | null>(null);
  const [loadingCats, setLoadingCats] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const debounceRef = useRef<number | null>(null);

  // Config consistent with desktop
  const minLen = 2;
  const pageSize = 8;

  // Open/close helpers
  const handleOpen = () => setSearchModalOpen(true);
  const handleClose = () => setSearchModalOpen(false);

  // ---- NEW: fetch categories once (just like SearchPage) ----
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCats(true);
        const raw = (await getAllCategories()) as unknown as CategoryModel[] | CategoryWithSubs;

        if (!alive) return;

        if (Array.isArray(raw)) {
          const rootNode = raw.find((c) => c.parentId == null) ?? raw[0];
          const subs = raw.filter((c) => c.parentId === rootNode.id);
          setRoot({ ...rootNode, subcategories: subs });
        } else {
          setRoot(raw);
        }
      } finally {
        if (alive) setLoadingCats(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ---- NEW: derive subcategories ----
  const categories = useMemo(() => root?.subcategories ?? [], [root]);

  // Read q from URL on first mount / when URL changes
  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q) {
      setSearchQuery(q);
      doSearch(q);
    } else {
      // clear results when URL has no q
      setSearchResults([]);
      setError(null);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // depend only on URL params

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const doSearch = async (value: string) => {
    const term = value.trim();
    if (!term || term.length < minLen) {
      setSearchResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const resp = await searchProducts(term, "name", "asc", 1, pageSize);
      const items = (resp as PagedList<ProductResponseModel>).items ?? [];
      setSearchResults(
        items.map((p) => ({
          id: p.id,
          name: p.name ?? "Unnamed product",
          images: p.images,
          price: p.price,
        }))
      );
    } catch (e: any) {
      setError(e?.message ?? "Search failed");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => doSearch(value), 300);
  };

  const goToResultsPage = (q: string) => {
    const term = q.trim();
    if (!term) return;
    router.push(`/en/category?q=${encodeURIComponent(term)}`);
    handleClose();
  };

  const hasQuery = useMemo(() => (searchQuery?.trim().length ?? 0) >= minLen, [searchQuery]);

  // ---- helper: category thumb / fallback ----
  const renderCatThumb = (c: CategoryModel) => {
    // თუ API-ს არ აქვს image ველი, ჩავსვათ ფოლბექი
    const img =
      // @ts-ignore optional field if you have it
      (c.image as string | undefined) ||
      // @ts-ignore optional field
      (c.imageUrl as string | undefined) ||
      "https://picsum.photos/seed/category/128/128";

    return (
      <Image
        alt={c.name ?? "Category Image"}
        className="h-16 w-16 object-contain mb-3"
        height={128}
        width={128}
        src={img}
      />
    );
  };

  return (
    <>
      {forBottomNav ? (
        <div
          className="flex flex-col items-center bg-transparent"
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleOpen();
          }}
        >
          <SearchIcon />
          <span className="text-xs">ძებნა</span>
        </div>
      ) : (
        <button
          className="flex items-center gap-1 bg-white rounded-full shadow-md border border-gray-300 cursor-pointer sm:w/full w-11/12 mx-auto px-4 py-2 transition focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-300"
          onClick={handleOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleOpen();
          }}
        >
          <SearchIcon className="text-gray-500" />
          <Input
            readOnly
            aria-controls="search-results"
            aria-expanded={isModalOpen}
            aria-label="Search"
            className="w-full h-full bg-white border-none focus:outline-none text-gray-700 text-[16px]"
            id="search-input"
            placeholder="What are you looking for?"
            type="search"
            value={searchQuery}
            onChange={() => { }}
          />
        </button>
      )}

      <Modal
        hideCloseButton
        isOpen={isModalOpen}
        motionProps={{
          variants: {
            enter: { y: 0, opacity: 1, transition: { duration: 0.1, ease: "easeOut" } },
            exit: { y: 0, opacity: 0, transition: { duration: 0.1, ease: "easeIn" } },
          },
        }}
        placement="top"
        scrollBehavior="inside"
        size="full"
        onClose={handleClose}
        className="dark:bg-brand-muteddark bg-brand-surface"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex items-center gap-2 px-1 pt-6 mx-4 z-50">
                <GoBackButton onClick={handleClose} />
                <div className="flex items-center gap-1 bg-white rounded-full shadow-md border border-gray-300 w-11/12 mx-auto px-4 py-2 focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-300">
                  <SearchIcon className="text-gray-500" />
                  <Input
                    aria-controls="search-results"
                    aria-expanded={isModalOpen}
                    autoComplete="off"
                    aria-label="Search"
                    className="w-full h-full bg-white border-none focus:outline-none text-gray-700 text-[15px]"
                    id="search-input"
                    placeholder="What are you looking for?"
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        goToResultsPage(searchQuery);
                      }
                    }}
                  />
                </div>
              </ModalHeader>

              <ModalBody id="search-results">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400 animate-pulse">
                    <SearchIcon className="h-12 w-12 mb-2 opacity-30" />
                    <p className="text-sm">Searching...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-6 text-red-500">
                    <p className="text-sm">Error: {error}</p>
                    <p className="text-xs text-gray-500 mt-1">Please try again.</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <SearchIcon className="h-12 w-12 mb-2 opacity-20" />
                    <p className="text-sm">
                      {hasQuery ? "No results found" : `Type at least ${minLen} characters`}
                    </p>

                    {/* ---- NEW: categories grid from API when no query ---- */}
                    {!hasQuery && (
                      <div className="grid grid-cols-3 gap-4 mt-6 w-full">
                        {loadingCats ? (
                          Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="p-4">
                              <div className="animate-pulse flex flex-col items-center">
                                <div className="h-16 w-16 bg-gray-300/50 rounded mb-3" />
                                <div className="h-3 w-20 bg-gray-300/50 rounded" />
                              </div>
                            </Card>
                          ))
                        ) : (
                          categories.map((category) => (
                            <Card
                              key={category.id}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => goToResultsPage(category.name ?? "")}
                            >
                              <CardBody className="flex flex-col items-center justify-center">
                                {renderCatThumb(category)}
                                <span className="text-sm font-medium text-center line-clamp-2">
                                  {category.name}
                                </span>
                              </CardBody>
                            </Card>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {searchResults.map((result) => (
                      <motion.li
                        key={result.id}
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: -5 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.1 }}
                        className="p-2 hover:bg-gray-100 hover:text-black rounded-md cursor-pointer"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => goToResultsPage(result.name ?? "")}
                      >
                        <div className="flex items-center gap-3">
                          {result.images?.[0] ? (
                            <div className="relative h-10 w-10 flex-shrink-0 rounded-md overflow-hidden border">
                              <Image
                                src={result.images[0]}
                                alt={result.name ?? "Product"}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-md flex items-center justify-center bg-gray-100 text-gray-500">
                              <SearchIcon className="h-5 w-5" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm line-clamp-1">{result.name}</span>
                            <span className="text-xs text-gray-500">
                              {typeof result.price === "number" ? `₾${result.price}` : ""}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                    <li className="mt-2">
                      <button
                        className="w-full text-center text-sm text-blue-600 underline py-2"
                        onClick={() => goToResultsPage(searchQuery)}
                      >
                        See all results for “{searchQuery.trim()}”
                      </button>
                    </li>
                  </ul>
                )}
              </ModalBody>

              <ModalFooter>
                <div className="md:hidden fixed bottom-1 left-1/2 z-50 transform -translate-x-1/2 w-11/12 rounded-2xl bg-black text-white shadow-md">
                  <div className="flex justify-around items-center py-2">
                    <Link className="flex flex-col items-center" href="/">
                      <HomeIcon className="text-green-500 w-6 h-6" />
                      <span className="text-xs">Home</span>
                    </Link>

                    <div
                      className="flex flex-col items-center bg-transparent"
                      role="button"
                      tabIndex={0}
                      onClick={handleClose}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleClose();
                      }}
                    >
                      <SearchIcon />
                      <span className="text-xs">Search</span>
                    </div>

                    <Cartlink />

                    <Link className="flex flex-col items-center" href={`/en/contact`}>
                      <ProfileIcon className="w-6 h-6" />
                      <span className="text-xs">Chat</span>
                    </Link>
                    <Link className="flex flex-col items-center" href="/login">
                      <ProfileIcon className="w-6 h-6" />
                      <span className="text-xs">Login</span>
                    </Link>
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
