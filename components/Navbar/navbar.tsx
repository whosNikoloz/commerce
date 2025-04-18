"use client";

import { Link } from "@heroui/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/button";

import { HeartFilledIcon, HomeIcon, ProfileIcon } from "../icons";
import { LanguageSwitch } from "../Switch/language";
import CartDropdown from "../Cart/cart-dropdown";
import Cartlink from "../Cart/cart-link";
import SearchModal from "../Search/search-modal";
import Search from "../Search/search-dropdown";
import SearchForMobile from "../Search/search-for-mobile";
import AuthForMobile from "../AuthModal/auth-for-mobile";

export const Navbar = () => {
  const user = null;
  const [isScrolled, setIsScrolled] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

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

  const pathname = usePathname();
  const isNotHome = pathname.length > 3;

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const lng = "en";

  return (
    <>
      {!isMobile || !isNotHome ? (
        <nav className="justify-center items-center">
          <div
            className={`z-50 fixed top-3 left-1/2 -translate-x-1/2 sm:w-6/12 w-11/12 rounded-2xl transition-all duration-300 ${
              isScrolled
                ? "dark:backdrop-blur-2xl backdrop-blur-sm dark:bg-black/10 bg-white shadow-md"
                : "bg-transparent"
            }`}
          >
            <div className="mx-auto px-4">
              <div className="flex items-center justify-between h-16">
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
                {isMobile ? <SearchForMobile setSearchQuery={setSearchQuery} searchQuery={searchQuery}/> : <Search setSearchQuery={setSearchQuery} searchQuery={searchQuery}/>}

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
                    <AuthForMobile />
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      ) : (
        <div className="p-3 flex items-center space-x-2 z-50">
          <button
            className="bg-white dark:bg-gray-800 shadow-md rounded-full p-2 flex items-center space-x-2"
            onClick={() => window.history.back()}
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
            <span className="text-sm text-gray-700 dark:text-white">Back</span>
          </button>
        </div>
      )}
      <div className="md:hidden z-50 fixed bottom-1 left-1/2 transform -translate-x-1/2 w-11/12 rounded-2xl bg-black text-white shadow-md">
        <div className="flex justify-around items-center py-2">
          <Link className="flex flex-col items-center" href={`/${lng}`}>
            <HomeIcon className="text-green-500 w-6 h-6" />
            <span className="text-xs">{lng === "en" ? "Home" : "მთავარი"}</span>
          </Link>

          <SearchModal setSearchQuery={setSearchQuery} searchQuery={searchQuery}/>

          <Cartlink />

          <Link className="flex flex-col items-center" href={`/${lng}/chat`}>
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
            <AuthForMobile />
          )}
        </div>
      </div>
    </>
  );
};
