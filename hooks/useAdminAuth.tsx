"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function useAdminAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const checkingRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const response = await fetch("/api/auth/token", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
          redirectToLogin();

          return;
        }

        const data = await response.json();

        if (!data.token) {
          redirectToLogin();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        redirectToLogin();
      } finally {
        checkingRef.current = false;
      }
    };

    const redirectToLogin = () => {
      // Extract locale from pathname (e.g., /en/admin -> en, /ka/admin -> ka)
      const locale = pathname.split("/")[1] || "ka";
      const loginPath = `/${locale}/admin`;
      const nextParam = pathname !== loginPath ? `?next=${encodeURIComponent(pathname)}` : "";

      router.push(`${loginPath}${nextParam}`);
    };

    // Check immediately on mount
    checkAuth();

    // Check every 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router, pathname]);
}
