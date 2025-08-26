"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";

import { TenantProvider } from "../context/tenantContext";

import { CartProvider } from "@/app/context/cartContext";
import { TranslationProvider } from "@/hooks/useTranslation";
import NextTopLoader from 'nextjs-toploader';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <TenantProvider>
        <NextThemesProvider {...themeProps}>
          <TranslationProvider>
            <NextTopLoader
              color="#2299DD"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={true}
              easing="ease"
              speed={200}
              shadow="0 0 10px #2299DD,0 0 5px #2299DD"
              template='<div class="bar" role="bar"><div class="peg"></div></div> 
                  <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
              zIndex={1600}
              showAtBottom={false}
            />
            <CartProvider>{children}</CartProvider>
            <Toaster richColors position="bottom-right" />
          </TranslationProvider>
        </NextThemesProvider>
      </TenantProvider>
    </HeroUIProvider>
  );
}
