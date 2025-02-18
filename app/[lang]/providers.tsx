"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { CartProvider } from "@/app/context/cartContext";
import { TranslationProvider } from "@/hooks/useTranslation";
import { Toaster, toast } from 'sonner';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <TranslationProvider>
          <CartProvider>{children}</CartProvider>
          <Toaster richColors position="top-right"/>
        </TranslationProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
