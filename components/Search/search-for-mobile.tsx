"use client";

import type { CategoryModel } from "@/types/category";
import type { ProductResponseModel } from "@/types/product";
import type { PagedList } from "@/types/pagination";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@headlessui/react";
import { motion } from "framer-motion";
import { MessageCircleIcon } from "lucide-react";

import { HomeIcon, SearchIcon } from "../icons";
import Cartlink from "../Cart/cart-link";
import { GoBackButton } from "../go-back-button";

import { searchProducts } from "@/app/api/services/productService";
import { getAllCategories } from "@/app/api/services/categoryService";
import { useSearchHistory } from "@/app/context/useSearchHistory"; // ✅ history
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

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

  // ✅ history hook
  const {
    items: historyItems,
    add: addHistory,
    remove: removeHistory,
    clear: clearHistory,
  } = useSearchHistory({ namespace: "global", max: 15 });

  // categories state
  const [root, setRoot] = useState<CategoryWithSubs | null>(null);
  const [loadingCats, setLoadingCats] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const debounceRef = useRef<number | null>(null);

  useBodyScrollLock(isModalOpen);


  const minLen = 2;
  const pageSize = 8;

  const handleOpen = () => setSearchModalOpen(true);
  const handleClose = () => setSearchModalOpen(false);

  // fetch categories once
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

  const categories = useMemo(() => root?.subcategories ?? [], [root]);

  // read q from URL
  useEffect(() => {
    const q = searchParams.get("q") || "";

    if (q) {
      setSearchQuery(q);
      doSearch(q);
    } else {
      setSearchResults([]);
      setError(null);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
        })),
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
    addHistory(term); // ✅ save to history on navigate
    router.push(`/en/category?q=${encodeURIComponent(term)}`);
    handleClose();
  };

  const hasQuery = useMemo(() => (searchQuery?.trim().length ?? 0) >= minLen, [searchQuery]);

  const selectHistoryTerm = (term: string) => {
    setSearchQuery(term);
    addHistory(term); // bump to top
    router.push(`/en/category?q=${encodeURIComponent(term)}`);
    handleClose();
  };

  const renderCatThumb = (c: CategoryModel) => {
    const img =
      // @ts-ignore optional field if present
      (c.image as string | undefined) ||
      // @ts-ignore optional field if present
      (c.imageUrl as string | undefined) ||
      "https://picsum.photos/seed/category/128/128";

    return (
      <Image
        alt={c.name ?? "Category Image"}
        className="h-16 w-16 object-contain mb-3"
        height={128}
        src={img}
        width={128}
      />
    );
  };

  return (
    <>
      {forBottomNav ? (
        <div
          className="flex flex-col items-center h-6"
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleOpen();
          }}
        >
          <SearchIcon height={19} width={19}/>        </div>
      ) : (
        <button
          className="flex items-center gap-1 bg-muted/50 rounded-full shadow-md border  cursor-pointer w-11/12 mx-auto p-0 px-4 transition focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-300"
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
            className="w-full pl-2 py-3 bg-transparent text-[16px]  rounded-full text-foreground placeholder-muted-foreground outline-none ring-0  transition-all"
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
        classNames={{
          wrapper:
            "h-[100lvh] max-h-[100lvh] min-h-[100lvh] p-0 m-0",
          base:
            "dark:bg-gray-900 bg-white !rounded-none h-full max-h-full " +
            "pt-[calc(env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)]",
          backdrop: "bg-black/40",
        }}
        isOpen={isModalOpen}
        motionProps={{
          variants: {
            enter: { y: 0, opacity: 1, transition: { duration: 0.12, ease: "easeOut" } },
            exit: { y: 0, opacity: 0, transition: { duration: 0.1, ease: "easeIn" } },
          },
        }}
        placement="top"
        scrollBehavior="inside"
        size="full"
        onClose={handleClose}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="z-50 flex items-center  pt-4 pb-3 shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <GoBackButton onClick={handleClose} />
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg w-full px-3 py-2.5 focus-within:bg-gray-50 dark:focus-within:bg-gray-750 transition-colors">
                  <SearchIcon className="text-gray-400 dark:text-gray-500 w-5 h-5 flex-shrink-0" />
                  <Input
                    aria-controls="search-results"
                    aria-expanded={isModalOpen}
                    aria-label="Search"
                    autoComplete="off"
                    className="w-full bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 text-[16px] placeholder:text-gray-500 dark:placeholder:text-gray-400"
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

              <ModalBody className="grow overflow-y-auto min-h-0 px-4 py-4" id="search-results">
                {/* === NO / SHORT QUERY VIEW === */}
                {!hasQuery && (
                  <div className="space-y-6">
                    {/* History: present or empty state */}
                    {historyItems.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">Recent searches</span>
                          <button
                            className="text-xs text-gray-500 underline hover:text-gray-700"
                            onClick={clearHistory}
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {historyItems.map(({ term }) => (
                            <div
                              key={term}
                              className="group flex items-center gap-2 px-3 py-1 rounded-full border text-sm hover:bg-gray-50"
                            >
                              <button
                                className="hover:underline"
                                onClick={() => selectHistoryTerm(term)}
                              >
                                {term}
                              </button>
                              <button
                                aria-label={`Remove ${term}`}
                                className="opacity-60 group-hover:opacity-100"
                                title="Remove"
                                onClick={() => removeHistory(term)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                        <SearchIcon className="h-12 w-12 mb-3 opacity-30" />
                        <p className="text-sm">You don’t have any search history yet</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Start typing to search products
                        </p>
                      </div>
                    )}

                    {/* Categories grid below history */}
                    <div>
                      <h3 className="text-sm text-gray-500 mb-3">Browse categories</h3>
                      <div className="grid grid-cols-3 gap-4 w-full">
                        {loadingCats
                          ? Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="p-4">
                              <div className="animate-pulse flex flex-col items-center">
                                <div className="h-16 w-16 bg-gray-300/50 rounded mb-3" />
                                <div className="h-3 w-20 bg-gray-300/50 rounded" />
                              </div>
                            </Card>
                          ))
                          : categories.map((category) => (
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
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* === LIVE SEARCH VIEW === */}
                {hasQuery && isLoading && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400 animate-pulse">
                    <SearchIcon className="h-12 w-12 mb-2 opacity-30" />
                    <p className="text-sm">Searching...</p>
                  </div>
                )}

                {hasQuery && !!error && (
                  <div className="flex flex-col items-center justify-center py-6 text-red-500">
                    <p className="text-sm">Error: {error}</p>
                    <p className="text-xs text-gray-500 mt-1">Please try again.</p>
                  </div>
                )}

                {hasQuery && !isLoading && !error && searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <SearchIcon className="h-12 w-12 mb-2 opacity-20" />
                    <p className="text-sm">No results found</p>
                  </div>
                )}

                {hasQuery && !isLoading && !error && searchResults.length > 0 && (
                  <ul className="space-y-1">
                    {searchResults.map((result) => (
                      <motion.li
                        key={result.id}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2 hover:bg-gray-100 hover:text-black rounded-md cursor-pointer"
                        exit={{ opacity: 0, y: -5 }}
                        initial={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.1 }}
                        onClick={() => {
                          router.push(`/en/product/${result.id}`);
                          handleClose();
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center gap-3">
                          {result.images?.[0] ? (
                            <div className="relative h-10 w-10 flex-shrink-0 rounded-md overflow-hidden border">
                              <Image
                                fill
                                alt={result.name ?? "Product"}
                                className="object-cover"
                                sizes="40px"
                                src={result.images[0]}
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
                    {/* <li className="mt-2">
                      <button
                        className="w-full text-center text-sm text-blue-600 underline py-2"
                        onClick={() => goToResultsPage(searchQuery)} // ✅ saves history
                      >
                        See all results for “{searchQuery.trim()}”
                      </button>
                    </li> */}
                  </ul>
                )}
              </ModalBody>

              <ModalFooter className="shrink-0">
                <div className="md:hidden z-50 fixed bottom-0 left-1/2 -translate-x-1/2 w-11/12 backdrop-blur-xl bg-brand-surface/80 dark:bg-brand-surfacedark/80 rounded-2xl shadow-md">
                  <div className="flex justify-around items-center py-2 space-x-3">
                    <Link className="flex flex-col items-center" href="/en">
                      <HomeIcon className="w-6 h-6 text-brand-primary dark:text-brand-primarydark" />
                      <span className="text-xs text-text-subtle dark:text-text-subtledark">Home</span>
                    </Link>

                    <div
                      className="flex flex-col items-center bg-transparent"
                      role="button"
                      tabIndex={0}
                      onClick={handleClose}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClose()}
                    >
                      <SearchIcon className="w-6 h-6" />
                      <span className="text-xs text-text-subtle dark:text-text-subtledark">Search</span>
                    </div>

                    <Cartlink />

                    <Link className="flex flex-col items-center" href={`/en/info/stores`}>
                      <MessageCircleIcon className="w-6 h-6 text-text-light dark:text-text-lightdark" />
                      <span className="text-xs text-text-subtle dark:text-text-subtledark">Chat</span>
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
