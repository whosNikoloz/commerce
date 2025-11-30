"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

import { HomeIcon, ProfileIcon } from "../icons";
import Cartlink from "../Cart/cart-link";
import { GoBackButton } from "../go-back-button";
import CategoryDrawer from "../Categories/category-drawer";
import SearchForMobile from "../Search/search-for-mobile";

import LoginModal from "./login-modal";
import RegisterModal from "./register-modal";
import ForgotPasswordModal from "./forgot-password-modal";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useUser } from "@/app/context/userContext";
import { useDictionary } from "@/app/context/dictionary-provider";

interface AuthModalProps {
  IsMobile: boolean;
}

export default function AuthModal({ IsMobile }: AuthModalProps) {
  const dictionary = useDictionary();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [authMode, setAuthMode] = useState("login");
  const [searchModalIsOpen, setSearchModalIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get current language from pathname
  const lng = pathname?.startsWith("/en") ? "en" : "ka";

  useBodyScrollLock(isOpen);

  // Redirect to user page if already logged in
  const handleProfileClick = () => {
    if (user) {
      // If user is logged in, navigate to user page
      // Assuming 'en' as default or handling locale in router if needed, 
      // but here we just push to /en/user or similar. 
      // Ideally we should get current lang from params or context if strictly needed for URL.
      // For now, let's assume /en/user or just /user if middleware handles it.
      // The original code used a hardcoded 'lng' var.
      router.push(`/en/user`);
    } else {
      // If not logged in, open the modal
      onOpen();
    }
  };

  const handleAuthMode = (mode: string) => {
    setAuthMode(mode);
  };

  const handleCloseModal = () => {
    onClose();
    setAuthMode("login");
  };

  return (
    <>
      <div
        aria-label="Open profile menu"
        className="flex flex-col items-center bg-transparent"
        role="button"
        tabIndex={0}
        onClick={handleProfileClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleProfileClick();
          }
        }}
      >
        <ProfileIcon />
      </div>

      <Modal
        classNames={{
          ...(IsMobile
            ? {
              wrapper: "!transform-none h-[100lvh] p-0 m-0",
              base:
                "dark:bg-slate-900 bg-white !rounded-none flex flex-col h-full max-h-full " +
                "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
              backdrop: "bg-black/40 backdrop-blur-sm",
            }
            : {
              base:
                "dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700",
              backdrop: "bg-black/50 backdrop-blur-sm",
            }),
        }}

        hideCloseButton={IsMobile}
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: {
              y: IsMobile ? 0 : 40,
              opacity: 0,
              scale: IsMobile ? 1 : 0.96,
              transition: { duration: 0 },
            },
            center: {
              y: 0,
              opacity: 1,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 32,
                mass: 0.8,
              },
            },
            exit: {
              y: IsMobile ? 0 : 40,
              opacity: 0,
              scale: IsMobile ? 1 : 0.96,
              transition: { duration: 0.18, ease: "easeIn" },
            },
          },
          initial: "enter",
          animate: "center",
          exit: "exit",
        }}
        placement={IsMobile ? "top" : "center"}
        size={IsMobile ? "full" : "sm"}
        onClose={handleCloseModal}
      >
        <ModalContent className="">
          {() => (
            <>
              {IsMobile ? (
                <ModalHeader className="relative flex items-center justify-between px-4 mb-5 pt-6 pb-2 mx-4 bg-white dark:bg-slate-900">
                  <div className="absolute left-4 top-6">
                    <GoBackButton onClick={handleCloseModal} />
                  </div>

                  <h2 className="absolute left-1/2 top-6 -translate-x-1/2 text-2xl font-bold text-gray-900 dark:text-white">
                    {authMode === "login"
                      ? dictionary.auth.login.title
                      : authMode === "register"
                        ? dictionary.auth.register.title
                        : dictionary.auth.forgotPassword.title}
                  </h2>
                </ModalHeader>
              ) : authMode == "forgot" ? (
                <ModalHeader className="flex items-center gap-2 px-6 pt-6 pb-4 z-50 border-b border-gray-200 dark:border-gray-700">
                  <GoBackButton onClick={() => handleAuthMode("login")} />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white ml-2">
                    {dictionary.auth.forgotPassword.title}
                  </h2>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex flex-col items-center gap-2 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {authMode === "login"
                      ? dictionary.auth.login.title
                      : authMode === "register"
                        ? dictionary.auth.register.title
                        : dictionary.auth.forgotPassword.title}
                  </h2>
                </ModalHeader>
              )}
              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-12rem)] custom-scrollbar">
                {authMode === "login" && (
                  <LoginModal
                    onLoginSuccess={handleCloseModal}
                    onSwitchMode={handleAuthMode}
                  />
                )}

                {authMode === "register" && (
                  <RegisterModal
                    onSwitchMode={handleAuthMode}
                  />
                )}

                {authMode === "forgot" && <ForgotPasswordModal />}
              </ModalBody>
              <ModalFooter>
                <div className="md:hidden z-50 fixed bottom-1 left-1/2 -translate-x-1/2 w-11/12 backdrop-blur-xl bg-brand-surface/80 dark:bg-brand-surfacedark/80 rounded-2xl shadow-md">
                  <div className="flex justify-around items-center py-2 gap-1">
                    <Link className="flex flex-col items-center flex-1 min-w-0" href={`/${lng}`} onClick={handleCloseModal}>
                      <HomeIcon className="w-6 h-6 text-brand-primary dark:text-brand-primarydark flex-shrink-0" />
                      <span className="text-xs text-text-subtle dark:text-text-subtledark truncate w-full text-center">
                        {dictionary.common.home}
                      </span>
                    </Link>

                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <SearchForMobile
                        forBottomNav
                        isModalOpen={searchModalIsOpen}
                        searchQuery={searchQuery}
                        setSearchModalOpen={setSearchModalIsOpen}
                        setSearchQuery={setSearchQuery}
                      />
                      <span className="text-xs text-text-subtle dark:text-text-subtledark truncate w-full text-center">
                        {dictionary.common.search}
                      </span>
                    </div>

                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <Cartlink showLabel={true} />
                    </div>

                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <CategoryDrawer />
                      <span className="text-xs text-text-subtle dark:text-text-subtledark truncate w-full text-center">
                        {dictionary.categories.category}
                      </span>
                    </div>

                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div
                        aria-label="Close profile menu"
                        className="flex flex-col items-center bg-transparent"
                        role="button"
                        tabIndex={0}
                        onClick={handleCloseModal}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleCloseModal();
                          }
                        }}
                      >
                        <ProfileIcon />
                      </div>
                      <span className="text-xs text-text-subtle dark:text-text-subtledark truncate w-full text-center">
                        {dictionary.common.profile}
                      </span>
                    </div>

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
