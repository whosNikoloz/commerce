"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

import { SunFilledIcon, MoonFilledIcon } from "./icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FooterLink = { href: string; label: string };
type LinkGroup = { title: string; links: FooterLink[] };
type Social = {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
};
const linkGroups: LinkGroup[] = [
  {
    title: "ჩვენ შესახებ",
    links: [
      { href: "/info/delivery", label: "მიწოდება" },
      { href: "/info/faq", label: "FAQ" },
      { href: "/info/stores", label: "ფილიალები" },
    ],
  },
  {
    title: "წესები & პირობები",
    links: [
      { href: "/info/terms-and-conditions", label: "წესები & პირობები" },
      { href: "/info/privacy-policy", label: "კონფიდენციალურობა" },
      { href: "/info/return-policy", label: "დაბრუნება" },
      { href: "/info/guarantee", label: "გარანტია" },
    ],
  },
];

const socials: Social[] = [
  { href: "#", label: "Facebook", icon: Facebook },
  { href: "#", label: "Instagram", icon: Instagram },
  { href: "#", label: "Twitter", icon: Twitter },
  { href: "#", label: "YouTube", icon: Youtube },
];

export function Footer() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const year = useMemo(() => new Date().getFullYear(), []);
  const nextMode = resolvedTheme === "dark" ? "light" : "dark";

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(nextMode);
  };

  return (
    <footer className="relative mt-24">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-b from-transparent via-slate-100/60 to-transparent dark:via-slate-800/60" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8  max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/60">
          {/* Header Row */}
          <div className="flex flex-col gap-6 border-b border-slate-200/70 p-6 md:flex-row md:items-center md:justify-between dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow"
              />
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                  FinaDevs
                </h3>
                <p className="font-sans text-sm text-slate-500 dark:text-slate-300">
                  Premium fashion for modern lifestyle
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              aria-label={`Switch to ${nextMode} mode`}
              title={`გადართე ${nextMode === "dark" ? "მუქ" : "ღია"} თემაზე`}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={toggleTheme}
            >
              <span className="sr-only">Theme toggle</span>
              {mounted ? (
                resolvedTheme === "dark" ? <SunFilledIcon size={18} /> : <MoonFilledIcon size={18} />
              ) : (
                <div className="h-[18px] w-[18px]" />
              )}
            </motion.button>
          </div>

          <div className="grid gap-10 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {linkGroups.map((group) => (
              <nav key={group.title} aria-labelledby={`footer-${group.title}`}>
                <h4
                  id={`footer-${group.title}`}
                  className="mb-3 font-semibold text-slate-900 dark:text-white"
                >
                  {group.title}
                </h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        className="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                        href={l.href}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div>
              <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">კონტაქტი</h4>

              <address className="not-italic">
                <ul className="mb-3  text-sm text-slate-600  dark:text-slate-300 flex gap-4">
                  <li className="flex items-center gap-2 w-max">
                    <Phone size={18} aria-hidden="true" />
                    <a
                      href="tel:+995577602399"
                      className="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                    >
                      577 60 23 99
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail size={18} aria-hidden="true" />
                    <a
                      href="mailto:dsada@gmail.com"
                      className="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                    >
                      dsada@gmail.com
                    </a>
                  </li>
                </ul>
              </address>

              <ul className="mb-4 flex items-center gap-3 text-slate-500 dark:text-slate-400">
                {socials.map(({ href, label, icon: Icon }) => (
                  <li key={label}>
                    {/* გარე ბმულებისთვის <a> + rel */}
                    <a
                      aria-label={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-full p-1 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                    >
                      <Icon size={18} />
                    </a>
                  </li>
                ))}
              </ul>

              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: ჩართეთ თქვენი subscribe ლოგიკა ან API ქოლი
                }}
                aria-label="სიახლეებზე გამოწერა"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  ელ-ფოსტის მისამართი
                </label>
                <Input
                  id="newsletter-email"
                  required
                  className="bg-white/80 placeholder:text-slate-400 dark:bg-slate-800/70"
                  placeholder="you@example.com"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                />
                <Button
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                  type="submit"
                >
                  გამოიწერე
                </Button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/70 px-6 py-5 text-center sm:flex-row dark:border-slate-700/60">
            <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
              © {year} StyleMove. All rights reserved.
            </p>
            <p className="font-sans text-xs text-slate-400 dark:text-slate-500">
              აშენებულია სიყვარულით • FinaDevs
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
