"use client";

import React, { useState } from "react";
import {
  IconArrowLeft,
  IconUserBolt,
  IconHome,
  IconBox,
  IconTags,
  IconFileDownloadFilled,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const links = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <IconHome className="h-5 w-5 text-text-subtle" />,
  },
  {
    label: "Brands",
    href: "/admin/brands",
    icon: <IconUserBolt className="h-5 w-5 text-text-subtle" />,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: <IconBox className="h-5 w-5 text-text-subtle" />,
  },
  {
    label: "Faqs",
    href: "/admin/faqs",
    icon: <FileQuestionIcon className="h-5 w-5 text-text-subtle" />,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: <IconTags className="h-5 w-5 text-text-subtle" />,
  },
  {
    label: "Sync",
    href: "/admin/sync",
    icon: <IconFileDownloadFilled className="h-5 w-5 text-text-subtle" />,
  },
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
        "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border bg-brand-muted dark:bg-brand-muteddark md:flex-row",
        "border-brand-muted dark:border-brand-muteddark",
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
            </div>
          </div>

          <Button
            className={cn(
              "flex items-center justify-start gap-2 group/sidebar py-2 p-0 bg-transparent",
              "text-text-light dark:text-text-lightdark",
            )}
            onPress={handleLogout}
          >
            <IconArrowLeft className="h-5 w-5 text-text-subtle" />
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
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

export const Logo = () => {
  return (
    <Link className="relative z-20 flex items-center space-x-2 py-1 text-sm font-medium" href="#">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-brand-primary" />
      <motion.span
        animate={{ opacity: 1 }}
        className="whitespace-pre text-text-light dark:text-text-lightdark"
        initial={{ opacity: 0 }}
      >
        Fina Devs
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link className="relative z-20 flex items-center space-x-2 py-1 text-sm font-medium" href="#">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-brand-primary" />
    </Link>
  );
};
