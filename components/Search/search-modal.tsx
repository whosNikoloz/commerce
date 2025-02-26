import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import Link from "next/link";

import { HomeIcon, ProfileIcon, SearchIcon } from "../icons";
import Cartlink from "../Cart/cart-link";
import { Input } from "@headlessui/react";

interface SearchForMobileProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SearchModal({ searchQuery, setSearchQuery }: SearchForMobileProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <div
        className="flex flex-col items-center bg-transparent"
        role="button"
        tabIndex={0}
        onClick={() => onOpen()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onOpen();
          }
        }}
      >
        <SearchIcon />
        <span className="text-xs">ძებნა</span>
      </div>
      <Modal
        isOpen={isOpen}
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
        size="full"
        onClose={onClose}
        hideCloseButton
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex items-center gap-2  px-4 pt-6 mx-4 z-50">
                <div className="flex items-center z-50">
                  <button
                    className=" shadow-md rounded-full  flex items-center space-x-2"
                    onClick={onClose}
                  >
                    <svg
                      className="w-6 h-6 text-gray-700 dark:text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 19l-7-7 7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center bg-white rounded-full shadow-md border border-gray-300 cursor-pointer w-11/12  mx-auto px-4 py-2 transition focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-300">
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />           
                </div>
              </ModalHeader>

              <ModalBody>
                <p>Search results go here...</p>
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
                      onClick={onClose}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          onClose();
                        }
                      }}
                    >
                      <SearchIcon />
                      <span className="text-xs">Search</span>
                    </div>

                    <Cartlink />

                    <Link className="flex flex-col items-center" href="/chat">
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
