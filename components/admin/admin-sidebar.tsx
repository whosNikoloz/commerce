"use client";
import React, { useEffect, useState } from "react";
import { IconArrowLeft, IconUserBolt, IconHome, IconBox, IconTags, IconFileDownloadFilled, IconColorFilter } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useRouter, useParams, usePathname } from "next/navigation"; // ⬅️ add usePathname
import { Button } from "@heroui/button";
import Link from "next/link";
import { CreditCard, FileQuestionIcon } from "lucide-react";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";


export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const router = useRouter();
  const pathname = usePathname();                 // ⬅️ current route
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = lang || "en";

  

  // ✅ Auto-close on route change (only on mobile)
  useEffect(() => {
    if (open && isMobile) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // whenever the route changes

  const links = [
    { label: "Dashboard",  href: `/${currentLang}/admin`,            icon: <IconHome className="h-5 w-5 text-slate-600 dark:text-slate-400" /> },
    { label: "Brands",     href: `/${currentLang}/admin/brands`,     icon: <IconUserBolt className="h-5 w-5 text-purple-600 dark:text-purple-400" /> },
    { label: "Products",   href: `/${currentLang}/admin/products`,   icon: <IconBox className="h-5 w-5 text-cyan-600 dark:text-cyan-400" /> },
    { label: "Faqs",       href: `/${currentLang}/admin/faqs`,       icon: <FileQuestionIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> },
    { label: "Categories", href: `/${currentLang}/admin/categories`, icon: <IconTags className="h-5 w-5 text-blue-600 dark:text-blue-400" /> },
    { label: "Sync",       href: `/${currentLang}/admin/sync`,       icon: <IconFileDownloadFilled className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> },
    { label: "Payments",    href: `/${currentLang}/admin/payments`,  icon: <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> },
    { label: "Tenants",    href: `/${currentLang}/admin/tenants`,    icon: <IconColorFilter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> },
  ];

  const handleLogout = async () => {
    // close first on mobile
    if (isMobile) setOpen(false);

    const res = await fetch("/api/auth/logout", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();

    if (!res.ok || !result.success) throw new Error(result.message || "Unauthorized");
    router.push(`/${currentLang}`);
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden md:flex-row",
        "bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100",
        "dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
        "h-screen relative",
      )}
    >
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}

            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <button
                  key={idx}
                  aria-label={link.label}
                  className="w-full text-left bg-transparent border-0 p-0 m-0 focus:outline-none"
                  tabIndex={0}
                  type="button"
                  onClick={() => isMobile && setOpen(false)}
                  onKeyDown={e => {
                    if ((e.key === "Enter" || e.key === " ") && isMobile) {
                      setOpen(false);
                    }
                  }}
                >
                  <SidebarLink link={link} />
                </button>
              ))}
            </div>
          </div>

          <Button
            className={cn(
              "flex items-center justify-start gap-2 group/sidebar py-2 p-0 bg-transparent hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md",
              "text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 backdrop-blur-sm",
            )}
            onPress={handleLogout}
          >
            <IconArrowLeft className="h-5 w-5 text-red-500 dark:text-red-400 transition-transform group-hover/sidebar:-translate-x-0.5" />
            <motion.span
              animate={{ display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }}
              className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0 font-semibold"
            >
              Logout
            </motion.span>
          </Button>
        </SidebarBody>
      </Sidebar>

      {children}
    </div>
  );
}

export const Logo = () => (
  <Link
    className="relative z-20 flex items-center space-x-3 py-2 text-sm font-medium group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 rounded-xl px-3 transition-all duration-300 shadow-sm hover:shadow-lg"
    href="#"
  >
    <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
      <span className="text-white font-bold text-sm">F</span>
    </div>
    <motion.span
      animate={{ opacity: 1 }}
      className="whitespace-pre text-slate-900 dark:text-slate-100 font-bold text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 tracking-tight"
      initial={{ opacity: 0 }}
    >
      Fina Devs
    </motion.span>
  </Link>
);

export const LogoIcon = () => (
  <Link
    className="relative z-20 flex items-center justify-center py-2 text-sm font-medium group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 rounded-xl p-2 transition-all duration-300"
    href="#"
  >
    <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
      <span className="text-white font-bold text-sm">F</span>
    </div>
  </Link>
);
