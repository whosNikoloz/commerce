"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar"

import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconHome,
  IconBox,
  IconCreditCard,
  IconChartBar,
  IconTags,
  IconTruck,
  IconUsers,
} from "@tabler/icons-react"

import { motion } from "framer-motion"

const links = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <IconHome className="h-5 w-5 text-muted-foreground" />,
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
  {
    label: "Logout",
    href: "#",
    icon: <IconArrowLeft className="h-5 w-5 text-muted-foreground" />,
  },
]

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)

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
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Manu Arora",
                href: "#",
                icon: (
                  <img
                    src="https://assets.aceternity.com/manu.png"
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
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
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Acet Labs
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};
