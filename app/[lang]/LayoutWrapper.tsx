"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/Navbar/navbar";
import { Footer } from "@/components/footer";
import GA4PageTracker from "@/components/Analytics/GA4PageTracker";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  const isAdminPage = pathname?.includes("/admin");

  return (
    <div className={`${isAdminPage ? "" : "relative flex flex-col  min-h-screen"}`}>
      <GA4PageTracker />
      {!isAdminPage && <Navbar />}
      <main className={`${isAdminPage ? "" : "   "}`}>{children}</main>
      {!isAdminPage && <Footer />}
    </div>
  );
}
