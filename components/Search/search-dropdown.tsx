import { Input } from "@headlessui/react";
import { Card, CardBody } from "@heroui/card";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { SearchIcon } from "../icons";

const Search = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  interface SearchResult {
    id: string;
    name: string;
  }

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleSearchFocus = () => {
    setIsOpen(true);
  };

  const staticSearchResults: SearchResult[] = [
    { id: "1", name: "Product 1" },
    { id: "2", name: "kroduct 2" },
    { id: "3", name: "roduct 3" },
  ];

  const handleSearchBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    const filteredResults = staticSearchResults.filter((result) =>
      result.name.toLowerCase().includes(e.target.value.toLowerCase())
    );

    setSearchResults(filteredResults);
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-center bg-white rounded-full shadow-md border border-gray-300 cursor-pointer sm:w-full w-11/12 mx-auto px-4 py-2 transition focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-300">
        <SearchIcon className="text-gray-500" />
        <Input
          aria-controls="search-results"
          aria-expanded={isOpen}
          aria-label="Search"
          className="w-full h-full bg-white border-none focus:outline-none text-gray-700 text-[16px]"
          id="search-input"
          placeholder="What are you looking for?"
          type="search"
          value={searchQuery}
          onBlur={handleSearchBlur}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 right-0 mt-5 z-50 "
            exit={{ opacity: 0, y: -10 }}
            id="search-results"
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardBody className="p-2">
                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <SearchIcon className="h-12 w-12 mb-2 opacity-20" />
                    <p className="text-sm">No results found</p>
                    {searchQuery && (
                      <p className="text-xs mt-1">
                        Try adjusting your search terms
                      </p>
                    )}
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {searchResults.map((result) => (
                      <motion.li
                        key={result.id}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                        exit={{ opacity: 0, y: -5 }}
                        initial={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.1 }}
                      >
                        {result.name}
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
