"use client";

import type { ProductResponseModel } from "@/types/product";
import type { PagedList } from "@/types/pagination";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@headlessui/react";
import { Card, CardBody } from "@heroui/card";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { SearchIcon } from "../icons";

import { searchProducts } from "@/app/api/services/productService";
import { useSearchHistory } from "@/app/context/useSearchHistory";
import { useGA4 } from "@/hooks/useGA4";
import { useDictionary } from "@/app/context/dictionary-provider";

// (Optional) tiny hook using matchMedia
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);

    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

interface SearchForMobileProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSearchModalOpen: (isOpen: boolean) => void;
  isModalOpen: boolean;
}

type SearchResult = Pick<ProductResponseModel, "id" | "name" | "images" | "price">;

const Search = ({
  searchQuery,
  setSearchQuery,
  isModalOpen,
  setSearchModalOpen,
}: SearchForMobileProps) => {
  const dictionary = useDictionary();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(isModalOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const debounceRef = useRef<number | null>(null);
  const { trackSearchQuery } = useGA4();

  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ your history hook
  const {
    items: historyItems,
    add: addHistory,
    remove: removeHistory,
    clear: clearHistory,
  } = useSearchHistory({ namespace: "global", max: 15 });

  // keep internal open state synced with parent
  useEffect(() => {
    setIsOpen(isModalOpen);
  }, [isModalOpen]);

  // ✅ Read "q" from URL and trigger search on first load
  useEffect(() => {
    const q = searchParams.get("q") || "";

    if (q) {
      setSearchQuery(q);
      doSearch(q); // optional: search immediately
    }
  }, [searchParams]);

  const handleSearchFocus = () => {
    setIsOpen(true);
    setSearchModalOpen(true);
  };

  const handleSearchBlur = () => {
    // delay to allow clicks inside the panel
    setTimeout(() => {
      setIsOpen(false);
      setSearchModalOpen(false);
    }, 200);
  };

  const minLen = 2;
  const pageSize = isMobile ? 6 : 8;

  const doSearch = async (value: string) => {
    const trimmed = value?.trim() ?? "";

    if (!trimmed || trimmed.length < minLen) {
      setSearchResults([]);
      setIsLoading(false);
      setError(null);

      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      // Track search query in GA4
      trackSearchQuery(trimmed);

      const resp = await searchProducts(trimmed, "name", "asc", 1, pageSize);
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
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    setIsLoading(true);
    setSearchResults([]);
    debounceRef.current = window.setTimeout(() => doSearch(value), 300);
  };

  const hasQuery = useMemo(() => (searchQuery?.trim().length ?? 0) >= minLen, [searchQuery]);

  // === History helpers ===
  const selectHistoryTerm = (term: string) => {
    setSearchQuery(term);
    addHistory(term); // bump to top
    router.push(`/en/category?q=${encodeURIComponent(term)}`);
    // keep panel open briefly for smoothness; close after navigation:
    setTimeout(() => {
      setIsOpen(false);
      setSearchModalOpen(false);
    }, 50);
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-1 bg-muted/50 rounded-full shadow-md border  cursor-pointer w-full mx-auto p-0 px-4 transition focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-300">
        <SearchIcon className="text-gray-500" />
        <Input
          aria-controls="search-results"
          aria-label="Search products"
          autoComplete="off"
          className="w-full pl-2 py-3 bg-transparent rounded-full text-foreground placeholder-muted-foreground transition-all
                    outline-none focus:outline-none ring-0 focus:ring-0 focus:border-transparent"
          id="search-input"
          placeholder={dictionary.search.placeholder}
          type="search"
          value={searchQuery}
          onBlur={handleSearchBlur}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (searchQuery.trim().length > 0) {
                addHistory(searchQuery);
                router.push(`/en/category?q=${encodeURIComponent(searchQuery)}`);
              }
            }
          }}
        />

      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 right-0 mt-5 z-50"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            // eslint-disable-next-line react/jsx-sort-props
            id="search-results"
            // Prevent input blur when clicking inside the panel
            onMouseDown={(e) => e.preventDefault()}
          >
            <Card>
              <CardBody className="p-5">
                {/* Show history when there's no (or too short) query */}
                {!hasQuery && historyItems.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-primary text-sm text-gray-500">{dictionary.search.recentSearches}</span>
                      <button className="font-primary text-xs text-gray-500 underline hover:text-gray-700"
                        onClick={clearHistory}
                      >
                        {dictionary.search.clearAll}
                      </button>
                    </div>

                    {/* Chips */}
                    <div className="flex flex-wrap gap-2">
                      {historyItems.map(({ term }) => (
                        <div
                          key={term}
                          className="group flex items-center gap-2 px-3 py-1 rounded-full border text-sm hover:bg-gray-50"
                        >
                          <button className="font-primary hover:underline"
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
                )}

                {/* Live search states */}
                {hasQuery && isLoading && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400 animate-pulse">
                    <SearchIcon className="h-12 w-12 mb-2 opacity-30" />
                    <p className="font-primary text-sm">{dictionary.search.searching}</p>
                  </div>
                )}

                {hasQuery && !!error && (
                  <div className="flex flex-col items-center justify-center py-6 text-red-500">
                    <p className="font-primary text-sm">{dictionary.search.error}: {error}</p>
                    <p className="font-primary text-xs text-gray-500 mt-1">{dictionary.search.tryAgain}</p>
                  </div>
                )}

                {hasQuery && !isLoading && !error && searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <SearchIcon className="h-12 w-12 mb-2 opacity-20" />
                    <p className="font-primary text-sm">{dictionary.search.noResults}</p>
                  </div>
                )}

                {!hasQuery && historyItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <SearchIcon className="h-12 w-12 mb-3 opacity-30" />
                    <p className="font-primary text-sm">{dictionary.search.noHistory}</p>
                    <p className="font-primary text-xs text-gray-500 mt-1">{dictionary.search.startTyping}</p>
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
                          addHistory(searchQuery); // save the actual typed query
                          router.push(`/en/product/${result.id}`);
                          setIsOpen(false);
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
                            <span className="font-primary text-sm line-clamp-1">{result.name ?? dictionary.search.unnamedProduct}</span>
                            <span className="font-primary text-xs text-gray-500">
                              {typeof result.price === "number" ? `₾${result.price}` : ""}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
