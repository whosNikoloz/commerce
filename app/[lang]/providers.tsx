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
import { UserProvider } from "../context/userContext";
import { CartUIProvider } from "../context/cart-ui";
import { DictionaryProvider } from "../context/dictionary-provider";
import { CookieConsentProvider } from "../context/cookieConsentContext";

import CookieBanner from "@/components/CookieConsent/CookieBanner";
import ManagePreferencesModal from "@/components/CookieConsent/ManagePreferencesModal";
import AnalyticsScripts from "@/components/Analytics/AnalyticsScripts";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  /** SSR-provided tenant config (from app/layout.tsx) */
  initialTenant: TenantConfig;
  dictionary: Record<string, any>;
  seo: any;
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

export function Providers({ children, themeProps, initialTenant, dictionary, seo }: ProvidersProps) {
  const router = useRouter();

  //console.log("⚙️ [PROVIDERS] Initializing with tenant:", initialTenant.siteConfig.name);

  return (
    <HeroUIProvider navigate={router.push}>
      <UserProvider>
        <TenantProvider initialConfig={initialTenant}>
          <NextThemesProvider {...defaultThemeProps} {...themeProps}>
            <CookieConsentProvider>
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
              <DictionaryProvider dictionary={dictionary}>
                <CartUIProvider>
                  {children}
                </CartUIProvider>
                <Toaster richColors position="bottom-right" />
                {/* Analytics Scripts - Respects Cookie Consent */}
                <AnalyticsScripts seo={seo} />
                {/* Cookie Consent UI Components */}
                <CookieBanner />
                <ManagePreferencesModal />
              </DictionaryProvider>
            </CookieConsentProvider>
          </NextThemesProvider>
        </TenantProvider>
      </UserProvider>
    </HeroUIProvider>
  );
}
