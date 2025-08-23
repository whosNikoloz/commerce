"use client";

import React, { useState } from "react";
import { IconArrowLeft, IconUserBolt, IconHome, IconBox, IconTags } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import Link from "next/link";
import Image from "next/image";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const links = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <IconHome className="h-5 w-5 text-muted-foreground" />,
  },
  {
    label: "Brands",
    href: "/admin/brands",
    icon: <IconUserBolt className="h-5 w-5 text-muted-foreground" />,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: <IconBox className="h-5 w-5 text-muted-foreground" />,
  },
  // {
  //   label: "Customers",
  //   href: "/admin/customers",
  //   icon: <IconUsers className="h-5 w-5 text-muted-foreground" />,
  // },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: <IconTags className="h-5 w-5 text-muted-foreground" />,
  },
  // {
  //   label: "Shipping",
  //   href: "/admin/shipping",
  //   icon: <IconTruck className="h-5 w-5 text-muted-foreground" />,
  // },
  // {
  //   label: "Payments",
  //   href: "/admin/payments",
  //   icon: <IconCreditCard className="h-5 w-5 text-muted-foreground" />,
  // },
  // {
  //   label: "Analytics",
  //   href: "/admin/analytics",
  //   icon: <IconChartBar className="h-5 w-5 text-muted-foreground" />,
  // },
  // {
  //   label: "Settings",
  //   href: "#",
  //   icon: <IconSettings className="h-5 w-5 text-muted-foreground" />,
  // },
];

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message || "Unauthorized");
    }
    router.push("/");
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-brand-mute dark:bg-brand-muteddark md:flex-row dark:border-neutral-700 ",
        "h-screen",
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
              <Button
                className={cn(
                  "flex items-center justify-start gap-2  group/sidebar py-2 p-0 bg-transparent",
                )}
                onPress={handleLogout}
              >
                <IconArrowLeft className="h-5 w-5 text-muted-foreground" />
                <motion.span
                  animate={{
                    display: true ? (open ? "inline-block" : "none") : "inline-block",
                    opacity: true ? (open ? 1 : 0) : 1,
                  }}
                  className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                >
                  Logout
                </motion.span>
              </Button>
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Manu Arora",
                href: "#",
                icon: (
                  <Image
                    alt="Avatar"
                    className="h-7 w-7 shrink-0 rounded-full"
                    height={50}
                    src="/img1.jpg"
                    width={50}
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      {children}
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
      href="#"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
        initial={{ opacity: 0 }}
      >
        Acet Labs
      </motion.span>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
      href="#"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </Link>
  );
};
