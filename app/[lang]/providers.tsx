"use client";

import type { ThemeProviderProps } from "next-themes";
import type { TenantConfig } from "@/types/tenant";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

import { TenantProvider } from "../context/tenantContext";

import { TranslationProvider } from "@/hooks/useTranslation";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  /** SSR-provided tenant config (from app/layout.tsx) */
  initialTenant: TenantConfig;
}

// Optional: sensible defaults for next-themes
const defaultThemeProps: ThemeProviderProps = {
  attribute: "class",
  defaultTheme: "system",
  enableSystem: true,
};

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
  }
}

export function Providers({ children, themeProps, initialTenant }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      {/* Pass SSR tenant to avoid flash; TenantProvider will also cache/apply CSS vars */}
      <TenantProvider initialConfig={initialTenant}>
        <NextThemesProvider {...defaultThemeProps} {...themeProps}>
          <TranslationProvider>
            {/* Use brand primary for loader via CSS var (fallback color provided) */}
            <NextTopLoader
              crawl
              showSpinner
              color={`rgb(var(--brand-primary, 34 153 221))`}
              crawlSpeed={200}
              easing="ease"
              height={3}
              initialPosition={0.08}
              shadow={`0 0 10px rgb(var(--brand-primary, 34 153 221)), 0 0 5px rgb(var(--brand-primary, 34 153 221))`}
              showAtBottom={false}
              speed={200}
              template={
                '<div class="bar" role="bar"><div class="peg"></div></div>' +
                '<div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
              }
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
