import { Input } from "@headlessui/react";
import { Card, CardBody } from "@heroui/card";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { SearchIcon } from "../icons";

interface SearchForMobileProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSearchModalOpen: (isOpen: boolean) => void;
  isModalOpen: boolean;
}

const Search = ({
  searchQuery,
  setSearchQuery,
  isModalOpen,
  setSearchModalOpen,
}: SearchForMobileProps) => {
  const [isOpen, setIsOpen] = useState(isModalOpen);
  const [isLoading, setIsLoading] = useState(false);

  interface SearchResult {
    id: string;
    name: string;
  }

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const staticSearchResults: SearchResult[] = [
    { id: "1", name: "Logitech Driving Force Shifter For X|S Xbox One..." },
    {
      id: "2",
      name: "Logitech G923 Racing Wheel and Pedals Xbox Series X|S...",
    },
    {
      id: "3",
      name: "Logitech G432 7.1 Surround Sound Wired Gaming Headset...",
    },
    { id: "4", name: "Xbox Wireless Controller Electric Volt" },
    { id: "5", name: "Xbox Wireless Controller Deep Pink" },
    { id: "6", name: "Razer Thresher Xbox One WL Gaming Over-Ear Headset..." },
    {
      id: "7",
      name: "Razer Nari Ultimate For Xbox One Wireless 7.1 Headset...",
    },
    { id: "8", name: "Razer Kaira Pro for Xbox Over-Ear Headset Black" },
    { id: "9", name: "Razer Thresher XboxOne Gears of War 5 WL Headset..." },
    { id: "10", name: "Flashfire Monza WH6301V Racing Wheel For PS4..." },
  ];

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setSearchQuery(value);
    setIsLoading(true);
    setSearchResults([]);

    // Simulate API call
    setTimeout(() => {
      const filteredResults = staticSearchResults.filter((result) =>
        result.name.toLowerCase().includes(value.toLowerCase()),
      );

      setSearchResults(filteredResults);
      setIsLoading(false);
    }, 2000); // simulate 1 second API call
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center bg-white rounded-full shadow-md border border-gray-300 cursor-pointer w-11/12 mx-auto px-4 py-2 transition focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-300">
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
            className="absolute left-0 right-0 mt-5 z-50"
            exit={{ opacity: 0, y: -10 }}
            id="search-results"
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardBody className="p-5">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400 animate-pulse">
                    <SearchIcon className="h-12 w-12 mb-2 opacity-30" />
                    <p className="text-sm">Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
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
                        className="p-2 hover:bg-gray-100 hover:text-black rounded-md cursor-pointer"
                        exit={{ opacity: 0, y: -5 }}
                        initial={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <SearchIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm">{result.name}</span>
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
