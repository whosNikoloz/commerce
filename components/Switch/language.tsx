"use client";

import type { Locale } from "@/i18n.config";

import { FC, useState, useEffect } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/switch";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";

import { GeorgiaIcon, EnglishIcon } from "@/components/icons";

export interface LanguageSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

export const LanguageSwitch: FC<LanguageSwitchProps> = ({ className, classNames }) => {
  const isSSR = useIsSSR();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if URL has /en prefix, otherwise it's ka (default)
  const currentLanguage: Locale = pathname?.startsWith("/en") ? "en" : "ka";

  const onChange = () => {
    const newLang: Locale = currentLanguage === "en" ? "ka" : "en";

    // If switching to English, add /en prefix
    if (newLang === "en") {
      // Remove any existing /ka prefix and add /en
      const cleanPath = pathname?.replace(/^\/(en|ka)/, '') || '';
      const newPath = `/en${cleanPath || '/'}`;

      router.push(newPath);
    } else {
      // If switching to Georgian (default), remove /en prefix
      const newPath = pathname?.replace(/^\/en/, '') || '/';

      router.push(newPath);
    }
  };

  const { Component, slots, isSelected, getBaseProps, getInputProps, getWrapperProps } = useSwitch({
    isSelected: currentLanguage === "ka" || isSSR,
    "aria-label": `Switch to ${currentLanguage === "ka" ? "English" : "Georgian"} mode`,
    onChange,
  });

  // Show a static placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={clsx(
          "px-px cursor-pointer flex items-center justify-center p-2",
          className,
        )}
      >
        <GeorgiaIcon size={30} />
      </div>
    );
  }

  return (
    <Component
      {...getBaseProps({
        className: clsx(
          "px-px transition-opacity  hover:opacity-80 cursor-pointer",
          className,
          classNames?.base,
        ),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div
        {...getWrapperProps()}
        className={clsx("flex items-center justify-center p-2", slots?.wrapper, classNames?.wrapper)}
      >
        {isSelected || isSSR ? <GeorgiaIcon size={30} /> : <EnglishIcon size={30} />}
      </div>
    </Component>
  );
};
