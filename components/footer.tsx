"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Facebook, Instagram, Mail, Phone, Twitter, Youtube } from "lucide-react";

import { SunFilledIcon, MoonFilledIcon } from "./icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FooterLink = { href: string; label: React.ReactNode };
type LinkGroup = { title: React.ReactNode; links: FooterLink[] };
type Social = {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
};

const translations: Record<string, string> = {
  "footer.aboutUs": "About Us",
  "footer.ourStory": "Our Story",
  "footer.careers": "Careers",
  "footer.press": "Press",
  "footer.support": "Support",
  "footer.helpCenter": "Help Center",
  "footer.contact": "Contact",
  "footer.shipping": "Shipping",
  "footer.legal": "Legal",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
};

export function Footer() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = (key: string, fallback?: string) => translations[key] || fallback || key;

  useEffect(() => setMounted(true), []);

  const year = useMemo(() => new Date().getFullYear(), []);
  const nextMode = resolvedTheme === "dark" ? "light" : "dark";

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(nextMode);
  };

  // socials unchanged
  const socials: Social[] = [
    { href: "#", label: "Facebook", icon: Facebook },
    { href: "#", label: "Instagram", icon: Instagram },
    { href: "#", label: "Twitter", icon: Twitter },
    { href: "#", label: "YouTube", icon: Youtube },
  ];

  // same groups/UI, but labels/titles come from provided i18n keys where available
  const linkGroups: LinkGroup[] = [
    {
      title: t("footer.aboutUs", "ჩვენს შესახებ"),
      links: [
        { href: "/info/delivery", label: t("footer.shippingInfo", "მიწოდება") },
        { href: "/info/faq", label: t("common.faq", "FAQ") },
        { href: "/info/stores", label: "ფილიალები" }, // no key provided; keeping literal
      ],
    },
    {
      title: t("footer.customerService", "მომხმარებელთა სერვისი"),
      links: [
        {
          href: "/info/terms-and-conditions",
          label: t("footer.termsOfService", "წესები & პირობები"),
        },
        { href: "/info/privacy-policy", label: t("footer.privacyPolicy", "კონფიდენციალურობა") },
        { href: "/info/return-policy", label: t("footer.returnPolicy", "დაბრუნება") },
        { href: "/info/guarantee", label: "გარანტია" }, // no key provided; keeping literal
      ],
    },
  ];

  return (
    <footer className="relative mt-24">
      {/* subtle divider glow */}
      {/* <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-b from-transparent via-brand-muted/60 to-transparent dark:via-brand-mutedDark/60" /> */}

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-brand-muted/60 bg-brand-surface/70 shadow-sm backdrop-blur dark:border-brand-mutedDark/60 dark:bg-brand-surfaceDark/60">
          {/* Header Row */}
          <div className="flex flex-col gap-6 border-b border-brand-muted/60 p-6 md:flex-row md:items-center md:justify-between dark:border-brand-mutedDark/60">
            <div className="flex items-center gap-3">
              <div
                aria-hidden
                className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primaryDark shadow"
              />
              <div>
                <h3 className="font-serif text-2xl font-bold text-text-light dark:text-text-lightDark">
                  {t("footer.brandName", "StyleMove")}
                </h3>
                <p className="font-sans text-sm text-text-subtle dark:text-text-subtleDark">
                  {t(
                    "footer.newsletterDescription",
                    "მიიღეთ უახლესი ინფორმაცია ახალი პროდუქტებისა და აქციების შესახებ",
                  )}
                </p>
              </div>
            </div>

            <motion.button
              aria-label={t("footer.switchTheme", "თემის შეცვლა")}
              className="inline-flex items-center justify-center rounded-full border border-brand-muted bg-brand-surface/80 p-2 text-text-light shadow-sm outline-none transition hover:bg-brand-surface focus-visible:ring-2 focus-visible:ring-brand-primary dark:border-brand-mutedDark dark:bg-brand-surfaceDark/80 dark:text-text-lightDark dark:hover:bg-brand-surfaceDark"
              title={
                resolvedTheme === "dark"
                  ? t("footer.lightMode", "ღია რეჟიმი")
                  : t("footer.darkMode", "მუქი რეჟიმი")
              }
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={toggleTheme}
            >
              <span className="sr-only">{t("footer.switchTheme", "თემის შეცვლა")}</span>
              {mounted ? (
                resolvedTheme === "dark" ? (
                  <SunFilledIcon size={18} />
                ) : (
                  <MoonFilledIcon size={18} />
                )
              ) : (
                <div className="h-[18px] w-[18px]" />
              )}
            </motion.button>
          </div>

          <div className="grid gap-10 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {linkGroups.map((group, idx) => (
              <nav key={idx} aria-labelledby={`footer-col-${idx}`}>
                <h4
                  className="mb-3 font-semibold text-text-light dark:text-text-lightDark"
                  id={`footer-col-${idx}`}
                >
                  {group.title}
                </h4>
                <ul className="space-y-2 text-sm text-text-subtle dark:text-text-subtleDark">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        className="hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:hover:text-text-lightDark"
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
              <h4 className="mb-3 font-semibold text-text-light dark:text-text-lightDark">
                {t("footer.contactUs", "კონტაქტი")}
              </h4>

              <address className="not-italic">
                <ul className="mb-3 flex gap-4 text-sm text-text-subtle dark:text-text-subtleDark">
                  <li className="flex w-max items-center gap-2">
                    <Phone aria-hidden size={18} />
                    <a
                      className="hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:hover:text-text-lightDark"
                      href="tel:+995577602399"
                    >
                      577 60 23 99
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail aria-hidden size={18} />
                    <a
                      className="hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:hover:text-text-lightDark"
                      href="mailto:dsada@gmail.com"
                    >
                      dsada@gmail.com
                    </a>
                  </li>
                </ul>
              </address>

              <p className="mb-2 text-sm font-medium text-text-subtle dark:text-text-subtleDark">
                {t("footer.followUs", "გამოგვყევით")}
              </p>
              <ul className="mb-4 flex items-center gap-3 text-text-subtle dark:text-text-subtleDark">
                {socials.map(({ href, label, icon: Icon }) => (
                  <li key={label}>
                    <a
                      aria-label={label}
                      className="inline-flex rounded-full p-1 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:hover:text-text-lightDark"
                      href={href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Icon size={18} />
                    </a>
                  </li>
                ))}
              </ul>

              <form
                aria-label={t("footer.newsletter", "სიახლეები")}
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <label className="sr-only" htmlFor="newsletter-email">
                  {t("footer.emailPlaceholder", "შეიყვანეთ ელ-ფოსტა")}
                </label>
                <Input
                  required
                  autoComplete="email"
                  className="bg-brand-surface/80 text-text-light placeholder:text-text-subtle border border-brand-muted focus-visible:ring-brand-primary dark:bg-brand-surfaceDark/70 dark:text-text-lightDark dark:placeholder:text-text-subtleDark dark:border-brand-mutedDark"
                  id="newsletter-email"
                  inputMode="email"
                  placeholder={t("footer.emailPlaceholder", "შეიყვანეთ ელ-ფოსტა")}
                  type="email"
                />
                <Button
                  className="bg-brand-primary text-white hover:bg-brand-primaryDark"
                  type="submit"
                >
                  {t("footer.subscribe", "გამოწერა")}
                </Button>
              </form>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-brand-muted/60 px-6 py-5 text-center sm:flex-row dark:border-brand-mutedDark/60">
            <p className="font-sans text-sm text-text-subtle dark:text-text-subtleDark">
              {t(
                "footer.copyright",
                `© ${year} ${t("footer.brandName", "StyleMove")} . All rights reserved.`,
              )}
            </p>
            <p className="font-sans text-xs text-text-subtle/80 dark:text-text-subtleDark/80">
              {t("footer.poweredBy", "• FinaDevs")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
