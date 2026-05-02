"use client";

import { motion } from "framer-motion";

export function LateBadge() {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
      className="inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white"
    >
      LATE
    </motion.span>
  );
}
