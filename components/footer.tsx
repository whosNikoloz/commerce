"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const year = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => setMounted(true), []);

  const nextMode = resolvedTheme === "dark" ? "light" : "dark";
  const toggleTheme = () => mounted && setTheme(nextMode);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  const socials = [
    { href: "https://facebook.com", label: "Facebook", icon: Facebook },
    { href: "https://instagram.com", label: "Instagram", icon: Instagram },
    { href: "https://twitter.com", label: "Twitter", icon: Twitter },
    { href: "https://youtube.com", label: "YouTube", icon: Youtube },
  ];

  const infoLinks = [
    { label: "Delivery", href: "/info/delivery" },
    { label: "FAQ", href: "/info/faq" },
    { label: "Guarantee", href: "/info/guarantee" },
    { label: "Privacy Policy", href: "/info/privacy-policy" },
    { label: "Return Policy", href: "/info/return-policy" },
    { label: "Stores", href: "/info/stores" },
    { label: "Terms & Conditions", href: "/info/terms-and-conditions" },
  ];

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="container mx-auto px-4 py-12">
        {/* TOP SECTION */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* LEFT: Newsletter + Theme Toggle */}
          <div className="lg:col-span-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-white leading-tight">Stay updated</h2>
              <button
                className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-900"
                type="button"
                onClick={toggleTheme}
              >
                {mounted ? (resolvedTheme === "dark" ? "Light" : "Dark") : "Theme"}
              </button>
            </div>

            <p className="text-sm text-zinc-400 mb-4">
              Weekly drops, exclusive deals, and style tips.
            </p>

            <form className="relative" onSubmit={handleNewsletterSubmit}>
              <Input
                required
                autoComplete="email"
                className="h-11 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 pr-12"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                className="absolute right-1 top-1 h-9 w-9 bg-white text-zinc-900 hover:bg-zinc-100"
                size="icon"
                type="submit"
              >
                →
              </Button>
            </form>

            {/* CONTACT */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              <a className="inline-flex items-center gap-2 hover:text-white" href="tel:+995577602399">
                <Phone className="h-4 w-4" /> +995 577 60 23 99
              </a>
              <a
                className="inline-flex items-center gap-2 hover:text-white"
                href="mailto:dsada@gmail.com"
              >
                <Mail className="h-4 w-4" /> dsada@gmail.com
              </a>
            </div>
          </div>

          {/* RIGHT: Info links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <nav>
              <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">
                Information
              </h3>
              <ul className="space-y-2">
                {infoLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      className="text-sm text-zinc-400 hover:text-white transition-colors"
                      href={href}
                      prefetch={false}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav>
              <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">
                Help & Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                    href="/info/faq"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                    href="/info/return-policy"
                  >
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                    href="/info/terms-and-conditions"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </nav>

            <nav>
              <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">
                About
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                    href="/info/stores"
                  >
                    Stores
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                    href="/info/privacy-policy"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                    href="/info/guarantee"
                  >
                    Guarantee
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <p className="text-zinc-500">© {year} StyleMove. All rights reserved.</p>
            <div className="flex gap-4">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  aria-label={label}
                  className="text-zinc-400 hover:text-white transition-colors inline-flex items-center"
                  href={href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <p className="text-xs text-zinc-500">• FinaDevs</p>
        </div>
      </div>
    </footer>
  );
}
