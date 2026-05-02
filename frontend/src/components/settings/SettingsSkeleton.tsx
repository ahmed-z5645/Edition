"use client";

import { motion } from "framer-motion";

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-bg/40 before:to-transparent";

const tile = (delay: number) => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { delay, type: "spring" as const, stiffness: 400, damping: 25 },
});

function FieldSkeleton({ delay, tall }: { delay: number; tall?: boolean }) {
  return (
    <motion.div className="space-y-1" {...tile(delay)}>
      <div className={`h-3.5 w-20 rounded-full bg-primary ${shimmer}`} />
      <div className={`w-full rounded-[15px] bg-primary ${tall ? "h-24" : "h-11"} ${shimmer}`} />
    </motion.div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Title */}
      <motion.div {...tile(0)} className={`h-16 w-52 rounded-[12px] bg-primary ${shimmer}`} />

      <div className="max-w-md space-y-5">
        {/* Avatar colour row */}
        <motion.div className="space-y-2" {...tile(0.05)}>
          <div className={`h-3.5 w-24 rounded-full bg-primary ${shimmer}`} />
          <div className="flex items-center gap-4">
            <div className={`size-16 shrink-0 rounded-full bg-primary ${shimmer}`} />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`size-8 rounded-full bg-primary ${shimmer}`} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Username */}
        <FieldSkeleton delay={0.1} />
        {/* Display name */}
        <FieldSkeleton delay={0.15} />
        {/* Bio */}
        <FieldSkeleton delay={0.2} tall />

        {/* Public profile toggle */}
        <motion.div className="flex items-center justify-between" {...tile(0.25)}>
          <div className={`h-3.5 w-24 rounded-full bg-primary ${shimmer}`} />
          <div className={`h-6 w-11 rounded-full bg-primary ${shimmer}`} />
        </motion.div>

        {/* Save button */}
        <motion.div {...tile(0.3)} className={`h-11 w-20 rounded-[15px] bg-primary ${shimmer}`} />

        {/* Divider */}
        <motion.hr {...tile(0.33)} className="border-primary" />

        {/* Sign out button */}
        <motion.div {...tile(0.36)} className={`h-11 w-24 rounded-[15px] bg-primary ${shimmer}`} />
      </div>
    </div>
  );
}
