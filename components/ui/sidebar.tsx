"use client";
import React, { useState, createContext, useContext, ComponentPropsWithoutRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX, IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  items?: Links[];
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider animate={animate} open={open} setOpen={setOpen}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();

  return (
    <>
      <motion.div
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
        }}
        className={cn(
          "h-full px-4 py-4 hidden md:flex md:flex-col bg-brand-mute dark:bg-brand-muteddark w-[300px] shrink-0 overflow-hidden will-change-[width]",
          className,
        )}
        transition={{
          duration: 0.2,
          ease: [0.25, 0.1, 0.25, 1],
          type: "tween"
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({ className, children, ...props }: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();

  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden  items-center justify-between  w-full",
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <IconMenu2
            className="text-neutral-800 dark:text-neutral-200"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              animate={{ x: 0, opacity: 1 }}
              className={cn(
                "fixed h-full w-full inset-0 p-10 z-[100] flex flex-col justify-between",
                className,
              )}
              exit={{ x: "-100%", opacity: 0 }}
              initial={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
            >
              <button
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
                onClick={() => setOpen(!open)}
              >
                <IconX />
              </button>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

type SidebarLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {
  link: Links;
  className?: string;
};

export const SidebarLink = ({ link, className, ...props }: SidebarLinkProps) => {
  const { open } = useSidebar();

  return (
    <Link
      className={cn("flex items-center justify-start gap-2 group/sidebar py-2", className)}
      href={link.href}
      prefetch={false}
      {...props}
    >
      <span className="shrink-0 flex items-center justify-center w-5 h-5">{link.icon}</span>

      <span
        className={cn(
          "text-neutral-700 dark:text-neutral-200 text-sm whitespace-nowrap inline-block transition-all duration-150",
          "group-hover/sidebar:translate-x-1",
          open ? "opacity-100" : "opacity-0 w-0 overflow-hidden absolute pointer-events-none"
        )}
      >
        {link.label}
      </span>
    </Link>
  );
};

export const SidebarGroup = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
} & React.ComponentProps<"div">) => {
  const { open, setOpen, animate } = useSidebar();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    if (!open) {
      setOpen(true);
      setIsExpanded(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  // If sidebar is closed, collapse the group
  useEffect(() => {
    if (!open) {
      setIsExpanded(false);
    }
  }, [open]);

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <button
        className={cn(
          "flex items-center justify-start gap-2 group/sidebar py-2 w-full text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors",
          className
        )}
        onClick={handleToggle}
      >
        <span className="shrink-0 flex items-center justify-center w-5 h-5">
          {link.icon}
        </span>

        <div
          className={cn(
            "flex items-center justify-between flex-1 overflow-hidden transition-all duration-150",
            open ? "opacity-100 w-auto" : "opacity-0 w-0"
          )}
        >
          <span className="text-neutral-700 dark:text-neutral-200 text-sm whitespace-nowrap">
            {link.label}
          </span>
          {isExpanded ? (
            <IconChevronDown className="w-4 h-4 text-neutral-500" />
          ) : (
            <IconChevronRight className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && open && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden pl-4 flex flex-col gap-1 mt-1 border-l border-neutral-200 dark:border-neutral-700 ml-2.5"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {link.items?.map((subLink) => (
              <SidebarLink key={subLink.href} link={subLink} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};