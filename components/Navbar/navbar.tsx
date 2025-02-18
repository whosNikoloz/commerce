"use client";

import { Link } from "@heroui/link";
import { useState, useEffect } from "react";
import Image from "next/image";

import { HeartFilledIcon, HomeIcon, ProfileIcon, SearchIcon, ShoppingCartIcon } from "../icons";
import { LanguageSwitch } from "../Switch/language";
import CartDropdown from "../Cart/cart-dropdown";
import Cartlink from "../Cart/cart-link";
import SearchModal from "../Search/serach-modal";

export const Navbar = () => {
  const user = null;
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = () => {
    const scrollY = window.scrollY;

    setIsScrolled(scrollY > 50);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const lng = "en";

  return (
    <>
      <nav className=" justify-center items-center">
        <div
          className={`z-50 fixed top-3 left-1/2 -translate-x-1/2 sm:w-5/12 w-11/12 rounded-2xl transition-all duration-300 ${
            isScrolled
              ? "dark:backdrop-blur-2xl backdrop-blur-sm dark:bg-black/10 bg-white shadow-md"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <Link className="flex items-center space-x-2" href={`/${lng}`}>
                  <HeartFilledIcon className="text-white text-2xl" />
                  <span className="font-bold text-xl text-white md:block hidden">
                    Test
                  </span>
                </Link>
              </div>

              <div className="flex-1 mx-4">
                <div className="relative w-full max-w-xl mx-auto">
                  <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-300">
                    <SearchIcon className="text-gray-500 ml-3" />
                    <input
                      className="w-full px-4 py-2 text-sm text-gray-800 bg-transparent border-none focus:outline-none"
                      placeholder="რას ეძებ?"
                      type="search"
                    />
                  </div>
                </div>
              </div>

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
                  <Image
                    alt="User Avatar"
                    className="rounded-full border border-gray-300"
                    height={40}
                    src={"/img1.jpg"}
                    width={40}
                  />
                )}
                
              </div>
              <div className="items-center space-x-4 hidden md:flex">
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-1 left-1/2 transform -translate-x-1/2 w-11/12 rounded-2xl bg-black text-white shadow-md">
        <div className="flex justify-around items-center py-2">
          <Link href={`/${lng}`} className="flex flex-col items-center">
            <HomeIcon className="text-green-500 w-6 h-6" />
            <span className="text-xs">{lng === "en" ? "Home" : "მთავარი"}</span>
          </Link>

          <SearchModal />

          <Cartlink />

          <Link href={`/${lng}/chat`} className="flex flex-col items-center">
            <ProfileIcon className="w-6 h-6" />
            <span className="text-xs">{lng === "en" ? "Chat" : "ჩათი"}</span>
          </Link>

          {user ? (
            <Link href={`/${lng}/profile`} className="relative flex flex-col items-center">
              <Image
                alt="User Avatar"
                className="rounded-full w-6 h-6"
                src="/img1.jpg"
              />
              <span className="text-xs">{lng === "en" ? "Profile" : "პროფილი"}</span>
            </Link>
          ) : (
            <Link href={`/${lng}/login`} className="flex flex-col items-center">
              <ProfileIcon className="w-6 h-6" />
              <span className="text-xs">{lng === "en" ? "Login" : "შესვლა"}</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};
