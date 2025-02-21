import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

import { HomeIcon, ProfileIcon, SearchIcon } from "../icons";
import { user } from "@heroui/theme";
import Link from "next/link";
import Cartlink from "../Cart/cart-link";

export default function SearchModal() {
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
      <Modal isOpen={isOpen} size="full" onClose={onClose}>
        <ModalContent>
          {(onClose) => (
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
                  <Link href={`/${"lng"}`} className="flex flex-col items-center">
                    <HomeIcon className="text-green-500 w-6 h-6" />
                    <span className="text-xs">{"en" === "en" ? "Home" : "მთავარი"}</span>
                  </Link>

                  <SearchModal />

                  <Cartlink />

                  <Link href={`/${"lng"}/chat`} className="flex flex-col items-center">
                    <ProfileIcon className="w-6 h-6" />
                    <span className="text-xs">{"en" === "en" ? "Chat" : "ჩათი"}</span>
                  </Link>
                    <Link href={`/${"lng"}/login`} className="flex flex-col items-center">
                      <ProfileIcon className="w-6 h-6" />
                      <span className="text-xs">{"en" === "en" ? "Login" : "შესვლა"}</span>
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
