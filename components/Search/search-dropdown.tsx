import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // ✅ for reading URL query params
import { Input } from "@headlessui/react";
import { Card, CardBody } from "@heroui/card";
import { motion, AnimatePresence } from "framer-motion";

import { SearchIcon } from "../icons";
import { searchProducts } from "@/app/api/services/productService";
import type { ProductResponseModel } from "@/types/product";
import type { PagedList } from "@/types/pagination";
import Image from "next/image";

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
  const [isOpen, setIsOpen] = useState(isModalOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const debounceRef = useRef<number | null>(null);

  const searchParams = useSearchParams(); // ✅
  const router = useRouter(); // ✅


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
    setTimeout(() => {
      setIsOpen(false);
      setSearchModalOpen(false);
    }, 200);
  };

  const minLen = 2;
  const pageSize = 8;

  const doSearch = async (value: string) => {
    if (!value || value.trim().length < minLen) {
      setSearchResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const resp = await searchProducts(value.trim(), "name", "asc", 1, pageSize);
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
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    setIsLoading(true);
    setSearchResults([]);
    debounceRef.current = window.setTimeout(() => doSearch(value), 300);
  };

  const hasQuery = useMemo(() => (searchQuery?.trim().length ?? 0) >= minLen, [searchQuery]);

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-1 bg-white rounded-full shadow-md border border-gray-300 cursor-pointer w-11/12 mx-auto px-4 py-2 transition focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-300">
        <SearchIcon className="text-gray-500" />
        <Input
          aria-controls="search-results"
          aria-expanded={isOpen}
          aria-label="Search"
          autoComplete="off"
          className="w-full h-full bg-white border-none focus:outline-none text-gray-700 text-[16px]"
          id="search-input"
          placeholder="What are you looking for?"
          type="search"
          value={searchQuery}
          onBlur={handleSearchBlur}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (searchQuery.trim().length > 0) {
                router.push(`/en/category?q=${encodeURIComponent(searchQuery)}`);
              }
            }
          }}
        />
      </div>

      {/* Results */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 mt-5 z-50"
            id="search-results"
          >
            <Card>
              <CardBody className="p-5">
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
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {searchResults.map((result) => (
                      <motion.li
                        key={result.id}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        initial={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.1 }}
                        className="p-2 hover:bg-gray-100 hover:text-black rounded-md cursor-pointer"
                        onMouseDown={(e) => e.preventDefault()}
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
