"use client";

import { Link } from "@heroui/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { HeartFilledIcon, HomeIcon, ProfileIcon } from "../icons";
import { LanguageSwitch } from "../Switch/language";
import CartDropdown from "../Cart/cart-dropdown";
import Cartlink from "../Cart/cart-link";
import Search from "../Search/search-dropdown";
import SearchForMobile from "../Search/search-for-mobile";
import { GoBackButton } from "../go-back-button";
import AuthModal from "../AuthModal/auth-modal";

export const Navbar = () => {
  const user = null;
  const [isScrolled, setIsScrolled] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [searchModalIsOpen, setSearchModalIsOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleScroll = () => {
    const scrollY = window.scrollY;

    setIsScrolled(scrollY > 50);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pathname = usePathname();
  const isCategory = pathname.includes("category");

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const lng = "en";

  return (
    <>
      {!isMobile || !isCategory ? (
        <nav className="justify-center items-center">
          <div
            className={`z-50 fixed top-3 left-1/2 -translate-x-1/2  w-11/12 rounded-2xl transition-all duration-300 ${
              isScrolled && searchModalIsOpen
                ? "dark:backdrop-blur-2xl backdrop-blur-sm w-11/12 md:w-10/12 lg:w-6/12 bg-black/50 shadow-md"
                : isScrolled
                  ? "dark:backdrop-blur-2xl backdrop-blur-sm  md:w-6/12 lg:w-3/12  bg-black/50 shadow-md"
                  : "bg-transparent w-11/12 md:w-10/12 lg:w-6/12"
            }`}
          >
            <div className="mx-auto px-4">
              <div className="flex items-center justify-between h-16 ">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                  <Link
                    className="flex items-center space-x-2"
                    href={`/${lng}`}
                  >
                    <HeartFilledIcon className="text-white text-2xl" />
                    <span className="font-bold text-xl text-white md:block hidden">
                      Test
                    </span>
                  </Link>
                </div>
                {isMobile ? (
                  <SearchForMobile
                    isModalOpen={searchModalIsOpen}
                    searchQuery={searchQuery}
                    setSearchModalOpen={setSearchModalIsOpen}
                    setSearchQuery={setSearchQuery}
                  />
                ) : (
                  <Search
                    isModalOpen={searchModalIsOpen}
                    searchQuery={searchQuery}
                    setSearchModalOpen={setSearchModalIsOpen}
                    setSearchQuery={setSearchQuery}
                  />
                )}

                <div className="items-center space-x-4 hidden md:flex">
                  <CartDropdown />
                  <LanguageSwitch />
                  {user ? (
                    <Image
                      alt="User Avatar"
                      className="rounded-full border border-gray-300"
                      height={40}
                      src={"/img1.jpg"}
                      width={40}
                    />
                  ) : (
                    <AuthModal IsMobile={isMobile} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      ) : (
        <div className="mt-6 ml-5">
          <GoBackButton onClick={() => window.history.back()} />
        </div>
      )}
      <div className="md:hidden z-50 fixed bottom-1 left-1/2 transform -translate-x-1/2 w-11/12 rounded-2xl bg-black text-white shadow-md">
        <div className="flex justify-around items-center py-2 space-x-3">
          <Link className="flex flex-col items-center" href={`/${lng}`}>
            <HomeIcon className="text-green-500 w-6 h-6" />
            <span className="text-xs">{lng === "en" ? "Home" : "მთავარი"}</span>
          </Link>
          {isMobile ? (
            <SearchForMobile
              forBottomNav={true}
              isModalOpen={searchModalIsOpen}
              searchQuery={searchQuery}
              setSearchModalOpen={setSearchModalIsOpen}
              setSearchQuery={setSearchQuery}
            />
          ) : (
            <></>
          )}
          <Cartlink />
          <Link className="flex flex-col items-center" href={`/${lng}/contact`}>
            <ProfileIcon className="w-6 h-6" />
            <span className="text-xs">{lng === "en" ? "Chat" : "ჩათი"}</span>
          </Link>
          {user ? (
            <Link
              className="relative flex flex-col items-center"
              href={`/${lng}/profile`}
            >
              <Image
                alt="User Avatar"
                className="rounded-full w-6 h-6"
                src="/img1.jpg"
              />
              <span className="text-xs">
                {lng === "en" ? "Profile" : "პროფილი"}
              </span>
            </Link>
          ) : (
            <AuthModal IsMobile={isMobile} />
          )}
        </div>
      </div>
    </>
  );
};
