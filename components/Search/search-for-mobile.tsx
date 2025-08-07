import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import Link from "next/link";
import { Input } from "@headlessui/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import Image from "next/image";

import { HomeIcon, ProfileIcon, SearchIcon } from "../icons";
import Cartlink from "../Cart/cart-link";
import { GoBackButton } from "../go-back-button";

interface SearchForMobileProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSearchModalOpen: (isOpen: boolean) => void;
  isModalOpen: boolean;
  forBottomNav?: boolean;
}

interface SearchResult {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
}

export default function SearchForMobile({
  searchQuery,
  setSearchQuery,
  isModalOpen,
  setSearchModalOpen,
  forBottomNav = false,
}: SearchForMobileProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = () => {
    setSearchModalOpen(true);
  };
  const handleClose = () => {
    setSearchModalOpen(false);
  };

  const categories: Category[] = [
    { id: "1", name: "Gaming", image: "https://picsum.photos/id/257/200/300" },
    {
      id: "2",
      name: "Electronics",
      image: "https://picsum.photos/id/253/200/300",
    },
    {
      id: "3",
      name: "Clothing",
      image: "https://picsum.photos/id/257/200/300",
    },
    { id: "4", name: "Shoes", image: "https://picsum.photos/id/257/200/300" },
    {
      id: "5",
      name: "Accessories",
      image: "https://picsum.photos/id/247/200/300",
    },
    {
      id: "6",
      name: "Furniture",
      image: "https://picsum.photos/id/217/200/300",
    },
    { id: "7", name: "Books", image: "https://picsum.photos/id/297/200/300" },
    { id: "8", name: "Movies", image: "https://picsum.photos/id/157/200/300" },
    { id: "9", name: "Music", image: "https://picsum.photos/id/357/200/300" },
  ];

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
    <>
      {forBottomNav ? (
        <div
          className="flex flex-col items-center bg-transparent"
          role="button"
          tabIndex={0}
          onClick={() => handleOpen()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleOpen();
            }
          }}
        >
          <SearchIcon />
          <span className="text-xs">ძებნა</span>
        </div>
      ) : (
        <button
          className="flex items-center ml-2 bg-white rounded-full shadow-md border border-gray-300 cursor-pointer sm:w-full w-11/12 mx-auto px-4 py-2 transition focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-300"
          onClick={handleOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleOpen();
            }
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
            onChange={handleSearchChange}
          />
        </button>
      )}

      <Modal
        hideCloseButton
        isOpen={isModalOpen}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.1,
                ease: "easeOut",
              },
            },
            exit: {
              y: 0,
              opacity: 0,
              transition: {
                duration: 0.1,
                ease: "easeIn",
              },
            },
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
              <ModalHeader className="flex items-center gap-2  px-1 pt-6 mx-4 z-50">
                <GoBackButton onClick={handleClose} />
                <div className="flex items-center bg-white rounded-full shadow-md border border-gray-300 cursor-pointer w-11/12  mx-auto px-4 py-2 transition focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-300">
                  <SearchIcon className="text-gray-500" />
                  <Input
                    aria-controls="search-results"
                    aria-expanded={isModalOpen}
                    aria-label="Search"
                    className="w-full h-full bg-white border-none focus:outline-none text-gray-700 text-[15px]"
                    id="search-input"
                    placeholder="What are you looking for?"
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </ModalHeader>

              <ModalBody>
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
                        <div className="flex items-center">
                          <SearchIcon className="h-4 w-4 text-gray-500 mr-3 flex-shrink-0" />
                          <span>{result.name}</span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
                <div className="grid grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card
                      key={category.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardBody className="flex flex-col items-center justify-center">
                        <Image
                          alt={category.name}
                          className="h-16 w-16 object-contain mb-3"
                          height={500}
                          src={category.image}
                          width={500}
                        />
                        <span className="text-sm font-medium text-center">
                          {category.name}
                        </span>
                      </CardBody>
                    </Card>
                  ))}
                </div>
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
                      onClick={handleOpen}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleClose();
                        }
                      }}
                    >
                      <SearchIcon />
                      <span className="text-xs">Search</span>
                    </div>

                    <Cartlink />

                    <Link
                      className="flex flex-col items-center"
                      href={`/en/contact`}
                    >
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
