"use client";

import { motion, type Variants, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";

/** keep keyframes + ease (not spring) for arrays in v11 */
const cartVariants: Variants = {
  idle: { scale: 1, rotate: 0 },
  firstAdd: {
    scale: [1, 1.18, 0.95, 1.03, 1],
    rotate: [0, 8, -6, 2, 0],
    transition: {
      duration: 0.6,
      times: [0, 0.2, 0.45, 0.7, 1],
      ease: "easeInOut",
    },
  },
};

/** Hook that:
 *  - plays the big bounce once (first time total goes from 0 -> >0)
 *  - bumps a key whenever total increases (so you can animate the count)
 */
export function useCartIconAnimation(total: number) {
  const controls = useAnimationControls();
  const prev = useRef<number>(total);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const p = prev.current ?? 0;

    if (p === 0 && total > 0) {
      controls.start("firstAdd").then(() => controls.start("idle"));
    } else if (total > p) {
      setAnimKey((k) => k + 1);
    }

    prev.current = total;
  }, [total, controls]);

  return { controls, animKey };
}

/** Wrap your icon to get the hover/tap spring + variant-driven bumps */
export function CartIconBouncer({
  controls,
  children,
  hover = true,
  tap = true,
}: PropsWithChildren<{
  controls: ReturnType<typeof useAnimationControls>;
  hover?: boolean;
  tap?: boolean;
}>) {
  return (
    <motion.div
      animate={controls}
      initial="idle"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transformOrigin: "center center",
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      variants={cartVariants}
      whileHover={hover ? { scale: 1.04 } : undefined}
      whileTap={tap ? { scale: 0.94 } : undefined}
    >
      {children}
    </motion.div>
  );
}

/** Animated number you can put inside a badge */
export function AnimatedCount({ value, animKey }: { value: number; animKey: number }) {
  return (
    <motion.span
      key={animKey}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }} // only runs if you wrap with <AnimatePresence>
      initial={{ scale: 0.6, opacity: 0 }}
      style={{
        display: "inline-block",
        transformOrigin: "center center",
      }}
      transition={{ type: "spring", stiffness: 560, damping: 20 }}
    >
      {value}
    </motion.span>
  );
}
