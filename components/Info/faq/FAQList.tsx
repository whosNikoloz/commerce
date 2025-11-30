"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Link as LinkIcon, Star } from "lucide-react";

type FAQItem = { id: string; q: string; a: string; featured?: boolean };

export function FAQList({ items }: { items: FAQItem[] }) {
  // Optional: featured-first ordering (keeps your original order among same group)
  const ordered = useMemo(
    () => [...items].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)),
    [items],
  );

  return (
    <motion.section
      animate="visible"
      aria-labelledby="faq-heading"
      className="rounded-2xl border bg-card"
      initial="hidden"
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { staggerChildren: 0.06, delayChildren: 0.04 },
        },
      }}
    >
      <h2 className="font-heading sr-only" id="faq-heading">
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
            "bg-gradient-to-br from-blue-50/80 to-transparent dark:from-blue-900/10"
          : "",
      ].join(" ")}
      variants={containerVariants}
    >
      {item.featured && (
        <motion.span
          aria-hidden
          animate={{ scaleY: 1 }}
          className="absolute left-0 top-0 h-full w-1.5 rounded-l-md bg-blue-400/80 dark:bg-blue-500/80"
          initial={{ scaleY: 0 }}
          style={{ transformOrigin: "top" }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
        />
      )}

      {item.featured && (
        <motion.div
          aria-hidden
          animate={{ boxShadow: "0 0 24px rgba(251, 191, 36, 0.18)" }}
          className="pointer-events-none absolute inset-0 rounded-2xl"
          initial={{ boxShadow: "0 0 0px rgba(251, 191, 36, 0)" }}
          transition={{ duration: 0.6, delay: 0.05 }}
        />
      )}

      <motion.button
        aria-controls={`${item.id}-panel`}
        aria-expanded={open}
        className="relative flex w-full items-center justify-between gap-4 text-left"
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        type="button"
        whileHover={{ y: -1 }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-primary flex items-center gap-2 text-base font-medium">
          {item.featured && (
            <span className="font-primary inline-flex items-center gap-1 rounded-full border border-blue-300/60 bg-blue-100/70 px-2 py-0.5 text-[11px] font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-500/40">
              <Star className="h-3.5 w-3.5 fill-current" /> გამოკვეთილი
            </span>
          )}
          <span>{item.q}</span>
        </span>

        <div className="flex items-center gap-3">
          <CopyAnchor id={item.id} />
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            className="grid h-6 w-6 place-content-center rounded-md border"
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            animate="open"
            className="overflow-hidden relative"
            exit="collapsed"
            id={`${item.id}-panel`}
            initial="collapsed"
            transition={{ height: { duration: 0.24 }, opacity: { duration: 0.2 } }}
            variants={{
              open: { height: "auto", opacity: 1, marginTop: 12 },
              collapsed: { height: 0, opacity: 0, marginTop: 0 },
            }}
          >
            <motion.div className="text-muted-foreground relative">{item.a}</motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function CopyAnchor({ id }: { id: string }) {
  return (
    <motion.a
      aria-label="ბმული ამ კითხვაზე"
      className="text-muted-foreground hover:text-foreground"
      href={`#${id}`}
      whileTap={{ scale: 0.92 }}
      onClick={() => {
        try {
          const u = new URL(window.location.href);

          u.hash = id;
          navigator.clipboard?.writeText(u.toString());
        } catch {}
      }}
    >
      <LinkIcon className="h-4 w-4" />
    </motion.a>
  );
}
