"use client";

import { Link } from "@heroui/link";
import { useState, useEffect } from "react";
import Image from "next/image";

import { HeartFilledIcon, SearchIcon } from "../icons";
import { LanguageSwitch } from "../Switch/language";
import CartDropdown from "../cart-dropdown";

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
          className={`z-50 fixed top-3 left-1/2 -translate-x-1/2 sm:w-8/12 w-11/12 rounded-2xl transition-all duration-300 ${
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
                <div className="items-center space-x-4 hidden md:flex">
                  <CartDropdown />
                </div>
              </div>
              <LanguageSwitch />
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`md:hidden fixed bottom-1  left-1/2 right-0 -translate-x-1/2 md:w-8/12 w-11/12 rounded-2xl dark:backdrop-blur-2xl backdrop-blur-sm dark:bg-black/10 bg-white shadow-md 
        }`}
      >
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex flex-1 items-stretch justify-between">
              <div className="flex flex-shrink-0 items-center">
                <Link href={`/${lng}`}>
                  <HeartFilledIcon />
                </Link>
                <Link
                  className={`font-bold text-inherit ml-2 ${
                    isScrolled
                      ? "dark:text-white text-black"
                      : "dark:text-white text-white"
                  }`}
                  href={`/${lng}`}
                >
                  Test
                </Link>
              </div>
              <div className="block">
                <div className="flex space-x-6">
                  <Link
                    className={`p-0 bg-transparent data-[hover=true]:bg-transparent transition-colors font-bold text-md ${
                      isScrolled
                        ? "dark:text-blue-500 text-blue-800"
                        : "dark:text-blue-500 text-blue-400"
                    }`}
                    href={`/${lng}/social`}
                  >
                    {lng === "en" ? "Category" : "სოციალური"}
                  </Link>
                  {user ? (
                    <Image
                      alt="User Avatar"
                      className="rounded-full"
                      height={40}
                      src={"/img1.jpg"}
                      width={40}
                    />
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
