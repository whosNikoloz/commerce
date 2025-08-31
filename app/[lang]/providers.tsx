"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

import { TenantProvider } from "../context/tenantContext";

import { TranslationProvider } from "@/hooks/useTranslation";

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
              crawl={true}
              crawlSpeed={200}
              easing="ease"
              height={3}
              initialPosition={0.08}
              shadow="0 0 10px #2299DD,0 0 5px #2299DD"
              showAtBottom={false}
              showSpinner={true}
              speed={200}
              template='<div class="bar" role="bar"><div class="peg"></div></div> 
                  <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
              zIndex={1600}
            />
            {children}
            <Toaster richColors position="bottom-right" />
          </TranslationProvider>
        </NextThemesProvider>
      </TenantProvider>
    </HeroUIProvider>
  );
}
