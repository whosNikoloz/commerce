"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Navbar } from "@/components/Navbar/navbar";
import GA4PageTracker from "@/components/Analytics/GA4PageTracker";
import Footer from "@/components/new-footer";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // More robust admin page check
  const isAdminPage = pathname?.includes("/admin") ?? false;
  const isProfilePage = pathname?.includes("/profile") ?? false;

  // Prevent hydration mismatch by not rendering Navbar until mounted
  const shouldShowNavbar = mounted && !isAdminPage;
  const shouldShowFooter = mounted && !isAdminPage;

  return (
    <div className={`${isAdminPage ? "" : "relative flex flex-col  min-h-screen"}`}>
      <GA4PageTracker />
      {shouldShowNavbar && (
        <div className={isProfilePage ? "hidden md:block" : ""}>
          <Navbar />
        </div>
      )}
      <main className={`${isAdminPage ? "" : "   "}`}>{children}</main>
      {shouldShowFooter && <Footer />}
    </div>
  );
}
