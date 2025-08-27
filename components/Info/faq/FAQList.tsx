"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Link as LinkIcon, Star } from "lucide-react";

type FAQItem = { id: string; q: string; a: string; featured?: boolean };

export function FAQList({ items }: { items: FAQItem[] }) {
    // Optional: featured-first ordering (keeps your original order among same group)
    const ordered = useMemo(
        () => [...items].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)),
        [items]
    );

    return (
        <motion.section
            aria-labelledby="faq-heading"
            className="rounded-2xl border bg-card"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0, y: 6 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
                },
            }}
        >
            <h2 id="faq-heading" className="sr-only">
                შეკითხვების სია
            </h2>

            <ul className="divide-y">
                {ordered.map((it) => (
                    <FAQRow key={it.id} item={it} />
                ))}
            </ul>
        </motion.section>
    );
}

function FAQRow({ item }: { item: FAQItem }) {
    const [open, setOpen] = useState(false);

    const containerVariants = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

    return (
        <motion.li
            layout
            className={[
                "p-5 relative",
                item.featured
                    ? // Featured decoration: gradient bg + left accent bar
                    "bg-gradient-to-br from-amber-50/80 to-transparent dark:from-amber-900/10"
                    : "",
            ].join(" ")}
            variants={containerVariants}
        >
            {item.featured && (
                <motion.span
                    aria-hidden
                    className="absolute left-0 top-0 h-full w-1.5 rounded-l-md bg-amber-400/80 dark:bg-amber-500/80"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 24 }}
                    style={{ transformOrigin: "top" }}
                />
            )}

            {item.featured && (
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    initial={{ boxShadow: "0 0 0px rgba(251, 191, 36, 0)" }}
                    animate={{ boxShadow: "0 0 24px rgba(251, 191, 36, 0.18)" }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                />
            )}

            <motion.button
                type="button"
                aria-expanded={open}
                aria-controls={`${item.id}-panel`}
                onClick={() => setOpen((v) => !v)}
                className="relative flex w-full items-center justify-between gap-4 text-left"
                whileHover={{ y: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
                <span className="flex items-center gap-2 text-base font-medium">
                    {item.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-100/70 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-500/40">
                            <Star className="h-3.5 w-3.5 fill-current" /> გამოკვეთილი
                        </span>
                    )}
                    <span>{item.q}</span>
                </span>

                <div className="flex items-center gap-3">
                    <CopyAnchor id={item.id} />
                    <motion.span
                        className="grid h-6 w-6 place-content-center rounded-md border"
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </motion.span>
                </div>
            </motion.button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        id={`${item.id}-panel`}
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { height: "auto", opacity: 1, marginTop: 12 },
                            collapsed: { height: 0, opacity: 0, marginTop: 0 },
                        }}
                        transition={{ height: { duration: 0.24 }, opacity: { duration: 0.2 } }}
                        className="overflow-hidden relative"
                    >
                        <motion.div className="text-muted-foreground relative">
                            {item.a}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.li>
    );
}

function CopyAnchor({ id }: { id: string }) {
    return (
        <motion.a
            href={`#${id}`}
            onClick={() => {
                try {
                    const u = new URL(window.location.href);
                    u.hash = id;
                    navigator.clipboard?.writeText(u.toString());
                } catch { }
            }}
            aria-label="ბმული ამ კითხვაზე"
            className="text-muted-foreground hover:text-foreground"
            whileTap={{ scale: 0.92 }}
        >
            <LinkIcon className="h-4 w-4" />
        </motion.a>
    );
}
