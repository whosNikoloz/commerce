"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SunFilledIcon, MoonFilledIcon } from "./icons";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const toggleTheme = () => {
        if (!mounted) return;
        setTheme(resolvedTheme === "light" ? "dark" : "light");
    };

    const year = new Date().getFullYear();

    return (
        <footer className="relative mt-24">
            <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-b from-transparent via-slate-100/60 to-transparent dark:via-slate-800/60" />

            <div className="mx-auto  px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/60">
                    <div className="flex flex-col gap-6 border-b border-slate-200/70 p-6 md:flex-row md:items-center md:justify-between dark:border-slate-700/60">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow" />
                            <div>
                                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">FinaDevs</h3>
                                <p className="font-sans text-sm text-slate-500 dark:text-slate-300">
                                    Premium fashion for modern lifestyle
                                </p>
                            </div>
                        </div>

                        <motion.button
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={toggleTheme}
                            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
                        >
                            {mounted && (resolvedTheme === "dark" ? <SunFilledIcon size={18} /> : <MoonFilledIcon size={18} />)}
                        </motion.button>
                    </div>

                    <div className="grid gap-10 p-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">Shop</h4>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                <li><Link href="/products" className="hover:text-slate-900 dark:hover:text-white">All Products</Link></li>
                                <li><Link href="/products?tab=new" className="hover:text-slate-900 dark:hover:text-white">New Arrivals</Link></li>
                                <li><Link href="/products?stock=instock" className="hover:text-slate-900 dark:hover:text-white">In Stock</Link></li>
                                <li><Link href="/categories" className="hover:text-slate-900 dark:hover:text-white">Categories</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                <li><Link href="/about" className="hover:text-slate-900 dark:hover:text-white">About</Link></li>
                                <li><Link href="/contact" className="hover:text-slate-900 dark:hover:text-white">Contact</Link></li>
                                <li><Link href="/careers" className="hover:text-slate-900 dark:hover:text-white">Careers</Link></li>
                                <li><Link href="/blog" className="hover:text-slate-900 dark:hover:text-white">Blog</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">Support</h4>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                <li><Link href="/support" className="hover:text-slate-900 dark:hover:text-white">Help Center</Link></li>
                                <li><Link href="/returns" className="hover:text-slate-900 dark:hover:text-white">Returns & Refunds</Link></li>
                                <li><Link href="/shipping" className="hover:text-slate-900 dark:hover:text-white">Shipping</Link></li>
                                <li><Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white">Privacy & Terms</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">Stay in the loop</h4>
                            <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                                Get product drops and updates straight to your inbox.
                            </p>
                            <form
                                onSubmit={(e) => { e.preventDefault(); /* handle subscribe */ }}
                                className="flex gap-2"
                            >
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="bg-white/80 placeholder:text-slate-400 dark:bg-slate-800/70"
                                    required
                                />
                                <Button type="submit" className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                                    Subscribe
                                </Button>
                            </form>
                            <div className="mt-4 flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                <a aria-label="Facebook" href="#" className="hover:text-slate-900 dark:hover:text-white">
                                    <Facebook size={18} />
                                </a>
                                <a aria-label="Instagram" href="#" className="hover:text-slate-900 dark:hover:text-white">
                                    <Instagram size={18} />
                                </a>
                                <a aria-label="Twitter" href="#" className="hover:text-slate-900 dark:hover:text-white">
                                    <Twitter size={18} />
                                </a>
                                <a aria-label="YouTube" href="#" className="hover:text-slate-900 dark:hover:text-white">
                                    <Youtube size={18} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* bottom bar */}
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/70 px-6 py-5 text-center sm:flex-row dark:border-slate-700/60">
                        <p className="font-sans text-sm text-slate-500 dark:text-slate-400">
                            © {year} StyleMove. All rights reserved.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <Link href="/privacy" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                                Privacy
                            </Link>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <Link href="/terms" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                                Terms
                            </Link>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <Link href="/contact" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
