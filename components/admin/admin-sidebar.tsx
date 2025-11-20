"use client";
import React, { useEffect, useState } from "react";
import { IconArrowLeft, IconHome, IconBox, IconTags, IconFileDownloadFilled, IconBook, IconLetterB } from "@tabler/icons-react";
import { useRouter, useParams, usePathname } from "next/navigation"; // ⬅️ add usePathname
import { Button } from "@heroui/button";
import { CreditCard, Database, FileQuestionIcon, Package, TruckIcon, Layers, Store, Palette } from "lucide-react";

import { ProfileIcon } from "../icons";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTenant } from "@/app/context/tenantContext";


export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { config } = useTenant();

  const router = useRouter();
  const pathname = usePathname();                 
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = lang || "en";

  // Check if merchant is FINA type (can sync)
  const isFinaMerchant = config?.merchantType === "FINA";


  // ✅ Auto-close on route change (only on mobile)
  useEffect(() => {
    if (open && isMobile) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // whenever the route changes

  const allLinks = [
    {
      label: "Dashboard",
      href: `/${currentLang}/admin`,
      icon: (
        <IconHome className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },

    {
      label: "Orders",
      href: `/${currentLang}/admin/orders`,
      icon: (
        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },
    {
      label: "Products",
      href: `/${currentLang}/admin/products`,
      icon: (
        <IconBox className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },
    {
      label: "Customers",
      href: `/${currentLang}/admin/customers`,
      icon: (
        <ProfileIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },

    {
      label: "Product Groups",
      href: `/${currentLang}/admin/product-groups`,
      icon: (
        <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },
    {
      label: "Categories",
      href: `/${currentLang}/admin/categories`,
      icon: (
        <IconTags className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },
    {
      label: "Facets",
      href: `/${currentLang}/admin/facets`,
      icon: (
        <IconBook className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },
    {
      label: "Brands",
      href: `/${currentLang}/admin/brands`,
      icon: (
        <IconLetterB className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },

    {
      label: "Payments",
      href: `/${currentLang}/admin/payments`,
      icon: (
        <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },
    {
      label: "Shippings",
      href: `/${currentLang}/admin/shipping`,
      icon: (
        <TruckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },
    {
      label: "Stores",
      href: `/${currentLang}/admin/stores`,
      icon: (
        <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },
    ...(isFinaMerchant
      ? [
          {
            label: "Sync",
            href: `/${currentLang}/admin/sync`,
            icon: (
              <IconFileDownloadFilled className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ),
          },
        ]
      : []),

    {
      label: "Analytics",
      href: `/${currentLang}/admin/analytics`,
      icon: (
        <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },
    {
      label: "Faqs",
      href: `/${currentLang}/admin/faqs`,
      icon: (
        <FileQuestionIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      ),
    },
  ];


  const links = allLinks;

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
            {/* <Logo /> */}
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <SidebarLink
                  key={link.href}
                  link={link}
                  onClick={() => isMobile && setOpen(false)}
                />
              ))}
              <a
                className={cn("flex items-center justify-start gap-2 group/sidebar py-2" , "text-indigo-600 dark:text-indigo-400")}
                href={"https://tenant-admin-panel.vercel.app/"}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="shrink-0 flex items-center justify-center w-5 h-5"><Palette /></span>
                <span
                  className={cn(
                    "text-neutral-700 dark:text-neutral-200 text-sm whitespace-nowrap inline-block transition-all duration-150",
                    "group-hover/sidebar:translate-x-1",
                    open ? "opacity-100" : "opacity-0 w-0 overflow-hidden absolute pointer-events-none"
                  )}
                >
                  Site Config
                </span>
              </a>
            </div>
          </div>

          <Button
            className={cn(
              "flex items-center justify-start gap-2 group/sidebar py-2 p-0 bg-transparent hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md",
              "text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 backdrop-blur-sm",
            )}
            onPress={handleLogout}
          >
            <IconArrowLeft className="h-5 w-5 text-red-500 dark:text-red-400 transition-transform group-hover/sidebar:-translate-x-0.5 shrink-0" />
            <span
              className={cn(
                "text-sm whitespace-nowrap inline-block font-semibold transition-all duration-150",
                "group-hover/sidebar:translate-x-1",
                open ? "opacity-100" : "opacity-0 w-0 overflow-hidden absolute pointer-events-none"
              )}
            >
              Logout
            </span>
          </Button>
        </SidebarBody>
      </Sidebar>

      {children}
    </div>
  );
}

// export const Logo = () => {
//   const { open } = useSidebar();

//   return (
//     <Link
//       className={cn(
//         "relative z-20 flex items-center py-2 text-sm font-medium group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 rounded-xl transition-colors duration-150",
//         open ? "space-x-3 px-3" : "justify-center p-2"
//       )}
//       href="#"
//     >
//       <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center">
//         <span className="text-white font-bold text-sm">F</span>
//       </div>
//       {open && (
//         <span className="whitespace-nowrap text-slate-900 dark:text-slate-100 font-bold text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150 tracking-tight">
//           Demo
//         </span>
//       )}
//     </Link>
//   );
// };
