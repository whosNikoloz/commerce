"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";

import { HomeIcon } from "../../icons";
import { LanguageSwitch } from "../../Switch/language";
import CartDrawer from "../../Cart/cart-drawer";
import Cartlink from "../../Cart/cart-link";
import CartDropdown from "../../Cart/cart-dropdown";
import Search from "../../Search/search-dropdown";
import SearchForMobile from "../../Search/search-for-mobile";
import { GoBackButton } from "../../go-back-button";
import CategoryDrawer from "../../Categories/category-drawer";
import CategoryDropdown from "../../Categories/category-dropdown";
import AuthModal from "../../AuthModal/auth-modal";

import { useIsMobile } from "@/hooks/use-mobile";
import { getCategoryById } from "@/app/api/services/categoryService";
import { CategoryModel } from "@/types/category";
import { useTenant } from "@/app/context/tenantContext";

export const NavbarTemplate2 = () => {
  const { config, isLoading } = useTenant();
  const site = config?.siteConfig;
  const cartVariant = config?.ui?.cartVariant ?? "dropdown";
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  // Get current language from pathname - if /en exists, use en, otherwise default to ka
  const lng = pathname.startsWith("/en") ? "en" : "ka";

  // Track when component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // scroll state
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

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
          // eslint-disable-next-line no-console
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

  // Use default logo during SSR, then switch to theme-specific logo after mount
  const logoSrc = mounted
    ? (resolvedTheme === "dark" ? site.logoDark : site.logoLight) || site.logo || "/logo.svg"
    : site.logo || "/logo.svg";


  return (
    <>
      {!isMobile || !isCategory ? (
        <nav className="w-full">
          {/* Top Bar - Announcement/Promo Strip */}
          <div className="w-full bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-brand-primary/10 dark:from-brand-primarydark/10 dark:via-brand-primarydark/5 dark:to-brand-primarydark/10 border-b border-brand-primary/10 dark:border-brand-primarydark/10">
            <div className="max-w-7xl mx-auto px-4 py-2">
              <p className="font-primary text-center text-xs md:text-sm tracking-wider text-text-subtle dark:text-text-subtledark font-light">
                {lng === "en" ? "FREE SHIPPING ON ORDERS OVER 100" : "უფასო მიწოდება 100-ზე მეტი ღირებულების შეკვეთებზე"}
              </p>
            </div>
          </div>

          {/* Main Navigation */}
          <div
            className={[
              "z-50 w-full transition-all duration-500 ease-in-out",
              isScrolled
                ? "fixed top-0 left-0 backdrop-blur-2xl bg-brand-surface/95 dark:bg-brand-surfacedark/95 shadow-lg border-b border-brand-primary/10 dark:border-brand-primarydark/10"
                : "bg-brand-surface/80 dark:bg-brand-surfacedark/80 backdrop-blur-sm"
            ].join(" ")}
          >
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <div className="flex items-center justify-between h-20">
                {/* Left Section - Categories */}
                <div className="flex items-center gap-6 flex-1">
                  <div className="hidden lg:flex items-center">
                    <CategoryDropdown />
                  </div>
                </div>

                {/* Center Section - Logo */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <Link
                    className="flex items-center group relative"
                    href={`/${lng}`}
                  >
                    <div className="relative">
                      <Image
                        unoptimized
                        alt="Site Logo"
                        className="select-none transition-all duration-500 group-hover:scale-110 object-contain drop-shadow-sm"
                        height={isScrolled ? 60 : 80}
                        src={logoSrc}
                        width={isScrolled ? 60 : 80}
                      />
                      <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/5 dark:group-hover:bg-brand-primarydark/5 rounded-full blur-xl transition-all duration-500" />
                    </div>
                  </Link>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center justify-end gap-3 flex-1">
                  {/* Search */}
                  <div className="flex items-center">
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
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden md:flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <AuthModal IsMobile={isMobile} />
                    </div>

                    <div className="h-8 w-px bg-brand-primary/20 dark:bg-brand-primarydark/20 mx-1" />

                    {cartVariant === "drawer" ? <CartDrawer /> : <CartDropdown />}

                    <div className="h-8 w-px bg-brand-primary/20 dark:bg-brand-primarydark/20 mx-1" />

                    <LanguageSwitch />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Navigation - Category Links (Desktop Only) */}
          <div className={[
            "hidden lg:block w-full border-b border-brand-primary/10 dark:border-brand-primarydark/10 transition-all duration-300",
            isScrolled ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
          ].join(" ")}>
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <div className="flex items-center justify-center gap-8 h-12">
                <Link
                  className="text-sm font-light tracking-widest uppercase text-text-light dark:text-text-lightdark hover:text-brand-primary dark:hover:text-brand-primarydark transition-colors duration-300 relative group"
                  href={`/${lng}`}
                >
                  {lng === "en" ? "New Arrivals" : "ახალი"}
                  <span className="font-primary absolute bottom-0 left-0 w-0 h-px bg-brand-primary dark:bg-brand-primarydark group-hover:w-full transition-all duration-300" />
                </Link>
                <Link
                  className="text-sm font-light tracking-widest uppercase text-text-light dark:text-text-lightdark hover:text-brand-primary dark:hover:text-brand-primarydark transition-colors duration-300 relative group"
                  href={`/${lng}`}
                >
                  {lng === "en" ? "Collections" : "კოლექცია"}
                  <span className="font-primary absolute bottom-0 left-0 w-0 h-px bg-brand-primary dark:bg-brand-primarydark group-hover:w-full transition-all duration-300" />
                </Link>
                <Link
                  className="text-sm font-light tracking-widest uppercase text-text-light dark:text-text-lightdark hover:text-brand-primary dark:hover:text-brand-primarydark transition-colors duration-300 relative group"
                  href={`/${lng}`}
                >
                  {lng === "en" ? "Sale" : "ფასდაკლება"}
                  <span className="font-primary absolute bottom-0 left-0 w-0 h-px bg-brand-primary dark:bg-brand-primarydark group-hover:w-full transition-all duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </nav>
      ) : (
        <div className="mt-4 relative flex items-center justify-between px-4 py-3 bg-brand-surface/95 dark:bg-brand-surfacedark/95 backdrop-blur-lg border-b border-brand-primary/10 dark:border-brand-primarydark/10">
          <div className="z-10">
            <GoBackButton onClick={() => window.history.back()} />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-base font-light tracking-wider text-text-light dark:text-text-lightdark text-center uppercase">
            {subcategoryName
              ? `${categoryName ?? category} / ${subcategoryName ?? subcategory}`
              : (categoryName ?? category)}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - Fashion Focused */}
      <div className="md:hidden z-50 fixed bottom-0 left-0 right-0 backdrop-blur-2xl bg-brand-surface/98 dark:bg-brand-surfacedark/98 border-t border-brand-primary/20 dark:border-brand-primarydark/20 shadow-2xl">
        <div className="flex justify-around items-center py-3 px-2">
          <Link
            className="flex flex-col items-center gap-1 min-w-[60px] group"
            href={`/${lng}`}
          >
            <div className="relative">
              <HomeIcon className="w-6 h-6 text-text-light dark:text-text-lightdark group-hover:text-brand-primary dark:group-hover:text-brand-primarydark transition-colors duration-300" />
              <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/10 dark:group-hover:bg-brand-primarydark/10 rounded-full blur-xl transition-all duration-300" />
            </div>
            <span className="font-primary text-[10px] font-light tracking-wider uppercase text-text-subtle dark:text-text-subtledark group-hover:text-brand-primary dark:group-hover:text-brand-primarydark transition-colors duration-300">
              {lng === "en" ? "Home" : "მთავარი"}
            </span>
          </Link>

          {isMobile && (
            <div className="flex flex-col items-center gap-1 min-w-[60px] group">
              <SearchForMobile
                forBottomNav
                isModalOpen={searchModalIsOpen}
                searchQuery={searchQuery}
                setSearchModalOpen={setSearchModalIsOpen}
                setSearchQuery={setSearchQuery}
              />
              <span className="font-primary text-[10px] font-light tracking-wider uppercase text-text-subtle dark:text-text-subtledark group-hover:text-brand-primary dark:group-hover:text-brand-primarydark transition-colors duration-300">
                {lng === "en" ? "Search" : "ძებნა"}
              </span>
            </div>
          )}

          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <Cartlink />
          </div>

          <div className="flex flex-col items-center gap-1 min-w-[60px] group">
            <CategoryDrawer />
            <span className="font-primary text-[10px] font-light tracking-wider uppercase text-text-subtle dark:text-text-subtledark group-hover:text-brand-primary dark:group-hover:text-brand-primarydark transition-colors duration-300">
              {lng === "en" ? "Shop" : "კატეგორია"}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 min-w-[60px] group">
            <AuthModal IsMobile={isMobile} />
            <span className="font-primary text-[10px] font-light tracking-wider uppercase text-text-subtle dark:text-text-subtledark group-hover:text-brand-primary dark:group-hover:text-brand-primarydark transition-colors duration-300">
              {lng === "en" ? "Account" : "პროფილი"}
            </span>
          </div>

        </div>
      </div>
    </>
  );
};
