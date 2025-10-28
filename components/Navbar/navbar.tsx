"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { HomeIcon } from "../icons";
import { LanguageSwitch } from "../Switch/language";
import CartDropdown from "../Cart/cart-dropdown";
import Cartlink from "../Cart/cart-link";
import Search from "../Search/search-dropdown";
import SearchForMobile from "../Search/search-for-mobile";
import { GoBackButton } from "../go-back-button";
import CategoryDrawer from "../Categories/category-drawer";
import CategoryDropdown from "../Categories/category-dropdown";
import AuthModal from "../AuthModal/auth-modal";

import { useIsMobile } from "@/hooks/use-mobile";
import { getCategoryById } from "@/app/api/services/categoryService";
import { CategoryModel } from "@/types/category";
import { useTenant } from "@/app/context/tenantContext";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { config, isLoading } = useTenant();
  const site = config?.siteConfig;

  // All hooks must be called unconditionally before any early returns
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchModalIsOpen, setSearchModalIsOpen] = useState(false);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [subcategoryName, setSubcategoryName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isMobile = useIsMobile();
  const pathname = usePathname();

  const isCategory = pathname.includes("category");
  const slugParts = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);
  const category = slugParts[2] || "";
  const subcategory = (slugParts[3] as string | null) || null;

  const lng = "en";

  // scroll state
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // category/subcategory სახელების წამოღება
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!isCategory) return;
        if (category) {
          const cat = (await getCategoryById(category)) as CategoryModel;

          if (alive) setCategoryName(cat?.name ?? null);
        }
        if (subcategory) {
          const sub = (await getCategoryById(subcategory)) as CategoryModel;

          if (alive) setSubcategoryName(sub?.name ?? null);
        }
      } catch (err) {
        // Log error only in development
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to fetch category/subcategory", err);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [isCategory, category, subcategory]);

  // Don't render until config is loaded (early return after all hooks)
  if (isLoading || !site) {
    return null;
  }


  return (
    <>
      {!isMobile || !isCategory ? (
        <nav className="justify-center items-center">
          <div
            className={[
              "z-50 fixed top-3 left-1/2 -translate-x-1/2 w-11/12 rounded-2xl transition-all duration-300",
              isScrolled && searchModalIsOpen
                ? "backdrop-blur-xl w-11/12 md:w-10/12 lg:w-6/12 bg-brand-surface/80 dark:bg-brand-surfacedark/80 shadow-md"
                : isScrolled
                  ? "backdrop-blur-xl bg-brand-surface/80 dark:bg-brand-surfacedark/80 rounded-2xl md:w-6/12 lg:w-3/12 shadow-md"
                  : "bg-transparent w-11/12 md:w-10/12 lg:w-6/12",
            ].join(" ")}
          >
            <div className="mx-auto px-4">
              <div className="flex items-center justify-between space-x-2 h-16">
                <div className="flex items-center">
                  <Link className="flex items-center  group" href={`/${lng}`}>
                    <Image
                      unoptimized
                      alt="Site Logo"
                      className=" select-none transition-transform duration-300 group-hover:scale-105 object-contain"
                      height={100}
                      src={site.logo}
                      width={100}
                    />

                    {/* <span
                      className={cn(
                        "font-bold text-xl whitespace-nowrap",
                        "text-text-light dark:text-text-lightdark",
                        "transition-all duration-300",
                        isScrolled
                          ? "opacity-0 translate-x-2 w-0 overflow-hidden"
                          : "opacity-100 translate-x-0 w-auto"
                      )}
                    >
                      {site.shortName}
                    </span> */}
                  </Link>
                </div>
                <div className="items-center hidden md:flex">
                   <CategoryDropdown />
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

                <div className="items-center hidden md:flex">
                  <CartDropdown />
                  <LanguageSwitch />
                  <AuthModal IsMobile={isMobile} />
                </div>
              </div>
            </div>
          </div>
        </nav>
      ) : (
        <div className="mt-2 relative flex items-center justify-between px-1">
          <div className="z-10">
            <GoBackButton onClick={() => window.history.back()} />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-text-light dark:text-text-lightdark text-center">
            {subcategoryName
              ? `${categoryName ?? category} / ${subcategoryName ?? subcategory}`
              : (categoryName ?? category)}
          </div>
        </div>
      )}

      <div className="md:hidden z-50 fixed bottom-0 left-1/2 -translate-x-1/2 w-11/12 backdrop-blur-xl bg-brand-surface/80 dark:bg-brand-surfacedark/80 rounded-2xl shadow-md">
        <div className="flex justify-around items-center py-2 space-x-1">
          <Link className="flex flex-col items-center" href={`/${lng}`}>
            <HomeIcon className="w-6 h-6 text-brand-primary dark:text-brand-primarydark" />
            <span className="text-xs text-text-subtle dark:text-text-subtledark">
              {lng === "en" ? "Home" : "მთავარი"}
            </span>
          </Link>

          

          {isMobile && (
            <div className="flex flex-col items-center">
              <SearchForMobile
                forBottomNav
                isModalOpen={searchModalIsOpen}
                searchQuery={searchQuery}
                setSearchModalOpen={setSearchModalIsOpen}
                setSearchQuery={setSearchQuery}
              />
              <span className="text-xs text-text-subtle dark:text-text-subtledark">
                {lng === "en" ? "Search" : "ძებნა"}
              </span>
            </div>
          )}

          <Cartlink />

          <div className="flex flex-col items-center">
            <CategoryDrawer />
            <span className="text-xs text-text-subtle dark:text-text-subtledark">
              {lng === "en" ? "Category" : "კატეგორია"}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <AuthModal IsMobile={isMobile} />
            <span className="text-xs text-text-subtle dark:text-text-subtledark">
              {lng === "en" ? "Profile" : "პროფილი"}
            </span>
          </div>

        </div>
      </div>
    </>
  );
};
