"use client";

import { Link } from "@heroui/link";
import { useState, useEffect } from "react";
import Image from "next/image";

import { HeartFilledIcon } from "../icons";
import CartModal from "../cartModal";

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
                    <Link
                      className={`p-0 bg-transparent data-[hover=true]:bg-transparent font-bold text-md ${
                        isScrolled
                          ? "dark:text-white text-black"
                          : "dark:text-white text-white"
                      }`}
                      href={`/${lng}/compiler/csharp`}
                    >
                      Compiler
                    </Link>
                  </div>
                </div>
              </div>
              <div className="pr-2 absolute inset-y-0 right-0 flex items-center sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {user ? (
                  <Image
                    alt="User Avatar"
                    className="rounded-full"
                    height={40}
                    src={"/img1.jpg"}
                    width={40}
                  />
                ) : (
                  <CartModal />
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`sm:hidden fixed bottom-1  left-1/2 right-0 -translate-x-1/2 sm:w-8/12 w-11/12 rounded-2xl dark:backdrop-blur-2xl backdrop-blur-sm dark:bg-black/10 bg-white shadow-md 
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
                    <CartModal />
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
