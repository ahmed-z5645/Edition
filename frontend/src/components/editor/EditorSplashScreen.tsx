"use client";

import { motion } from "framer-motion";

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-bg/40 before:to-transparent";

const tile = (delay: number) => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { delay, type: "spring" as const, stiffness: 400, damping: 25 },
});

export function EditorSplashScreen() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Toolbar row */}
      <motion.div className="flex items-center justify-between" {...tile(0)}>
        <div className={`h-5 w-24 rounded-full bg-primary ${shimmer}`} />
        <div className={`h-9 w-20 rounded-[10px] bg-primary ${shimmer}`} />
      </motion.div>

      {/* Title */}
      <motion.div {...tile(0.05)} className={`h-12 w-3/5 rounded-[12px] bg-primary ${shimmer}`} />

      {/* Week label */}
      <motion.div {...tile(0.1)} className={`h-4 w-28 rounded-full bg-primary ${shimmer}`} />

      {/* Bento grid skeleton — 4 col */}
      <div className="grid grid-cols-4 gap-3" style={{ gridAutoRows: "80px" }}>
        <motion.div {...tile(0.12)} className={`col-span-2 row-span-2 rounded-[15px] bg-primary ${shimmer}`} />
        <motion.div {...tile(0.16)} className={`col-span-1 row-span-1 rounded-[15px] bg-primary ${shimmer}`} />
        <motion.div {...tile(0.2)}  className={`col-span-1 row-span-2 rounded-[15px] bg-primary ${shimmer}`} />
        <motion.div {...tile(0.24)} className={`col-span-1 row-span-1 rounded-[15px] bg-primary ${shimmer}`} />
        <motion.div {...tile(0.28)} className={`col-span-2 row-span-1 rounded-[15px] bg-primary ${shimmer}`} />
      </div>
    </div>
  );
}
