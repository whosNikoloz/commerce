"use client";

import type { Locale } from "@/i18n.config";

import { FC } from "react";
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
  const currentLanguage: Locale = pathname?.startsWith("/ka") ? "ka" : "en";

  const onChange = () => {
    const newLang: Locale = currentLanguage === "en" ? "ka" : "en";
    const newPath = pathname?.replace(/^\/(en|ka)/, `/${newLang}`) || `/${newLang}`;

    router.push(newPath);
  };

  const { Component, slots, isSelected, getBaseProps, getInputProps, getWrapperProps } = useSwitch({
    isSelected: currentLanguage === "ka" || isSSR,
    "aria-label": `Switch to ${currentLanguage === "ka" ? "English" : "Georgian"} mode`,
    onChange,
  });

  return (
    <Component
      {...getBaseProps({
        className: clsx(
          "px-px transition-opacity hover:opacity-80 cursor-pointer",
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
        className={slots.wrapper({
          class: clsx(
            [
              "w-auto h-auto",
              "bg-transparent",
              "rounded-lg",
              "flex items-center justify-center",
              "group-data-[selected=true]:bg-transparent",
              "!text-default-500",
              "pt-px",
              "px-0",
              "mx-0",
            ],
            classNames?.wrapper,
          ),
        })}
      >
        {isSelected || isSSR ? <GeorgiaIcon size={30} /> : <EnglishIcon size={30} />}
      </div>
    </Component>
  );
};
