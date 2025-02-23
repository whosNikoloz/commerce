import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import Link from "next/link";
import { Input } from "@headlessui/react";

import { HomeIcon, ProfileIcon, SearchIcon } from "../icons";
import Cartlink from "../Cart/cart-link";

export default function SearchForMobile() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <button
        className="flex items-center bg-white rounded-full shadow-md border border-gray-300 cursor-pointer sm:w-full w-11/12 mx-auto px-4 py-2 transition focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-300"
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onOpen();
          }
        }}
      >
        <SearchIcon className="text-gray-500" />
        <Input
          readOnly
          aria-controls="search-results"
          aria-expanded={isOpen}
          aria-label="Search"
          className="w-full h-full bg-white border-none focus:outline-none text-gray-700 text-[16px]"
          id="search-input"
          placeholder="What are you looking for?"
          type="search"
        />
      </button>

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
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Modal Title
              </ModalHeader>
              <ModalBody>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
                <p>
                  Magna exercitation reprehenderit magna aute tempor cupidatat
                  consequat elit dolor adipisicing. Mollit dolor eiusmod sunt ex
                  incididunt cillum quis. Velit duis sit officia eiusmod Lorem
                  aliqua enim laboris do dolor eiusmod.
                </p>
              </ModalBody>
              <ModalFooter>
                <div className="md:hidden fixed bottom-1 left-1/2 z-50 transform -translate-x-1/2 w-11/12 rounded-2xl bg-black text-white shadow-md">
                  <div className="flex justify-around items-center py-2">
                    <Link
                      className="flex flex-col items-center"
                      href={`/${"lng"}`}
                    >
                      <HomeIcon className="text-green-500 w-6 h-6" />
                      <span className="text-xs">
                        {"en" === "en" ? "Home" : "მთავარი"}
                      </span>
                    </Link>

                    <div
                      className="flex flex-col items-center bg-transparent"
                      role="button"
                      tabIndex={0}
                      onClick={() => onClose()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          onClose();
                        }
                      }}
                    >
                      <SearchIcon />
                      <span className="text-xs">ძებნა</span>
                    </div>

                    <Cartlink />

                    <Link
                      className="flex flex-col items-center"
                      href={`/${"lng"}/chat`}
                    >
                      <ProfileIcon className="w-6 h-6" />
                      <span className="text-xs">
                        {"en" === "en" ? "Chat" : "ჩათი"}
                      </span>
                    </Link>
                    <Link
                      className="flex flex-col items-center"
                      href={`/${"lng"}/login`}
                    >
                      <ProfileIcon className="w-6 h-6" />
                      <span className="text-xs">
                        {"en" === "en" ? "Login" : "შესვლა"}
                      </span>
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
