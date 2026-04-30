"use client";

import { motion } from "framer-motion";

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-bg/40 before:to-transparent";

const tile = (delay: number) => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { delay, type: "spring" as const, stiffness: 400, damping: 25 },
});

function RequestSkeleton({ delay }: { delay: number }) {
  return (
    <motion.div
      {...tile(delay)}
      className="flex items-center justify-between rounded-[15px] border border-primary p-4"
    >
      <div className="flex items-center gap-3">
        <div className={`size-10 shrink-0 rounded-full bg-primary ${shimmer}`} />
        <div className="space-y-1.5">
          <div className={`h-3.5 w-28 rounded-full bg-primary ${shimmer}`} />
          <div className={`h-3 w-20 rounded-full bg-primary ${shimmer}`} />
        </div>
      </div>
      <div className="flex gap-2">
        <div className={`h-8 w-18 rounded-[10px] bg-primary ${shimmer}`} />
        <div className={`h-8 w-16 rounded-[10px] bg-primary ${shimmer}`} />
      </div>
    </motion.div>
  );
}

function NotificationRowSkeleton({ delay }: { delay: number }) {
  return (
    <motion.div
      {...tile(delay)}
      className="flex items-center gap-3 rounded-[15px] p-4"
    >
      <div className={`size-10 shrink-0 rounded-full bg-primary ${shimmer}`} />
      <div className="flex-1 space-y-1.5">
        <div className={`h-3.5 w-3/5 rounded-full bg-primary ${shimmer}`} />
      </div>
      <div className={`h-3 w-10 shrink-0 rounded-full bg-primary ${shimmer}`} />
    </motion.div>
  );
}

export function NotificationsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Title */}
      <motion.div {...tile(0)} className={`h-14 w-72 rounded-[12px] bg-primary md:h-16 ${shimmer}`} />

      {/* Follow requests section */}
      <div className="space-y-3">
        <motion.div {...tile(0.04)} className={`h-6 w-36 rounded-[8px] bg-primary ${shimmer}`} />
        <div className="space-y-2">
          <RequestSkeleton delay={0.08} />
          <RequestSkeleton delay={0.12} />
        </div>
      </div>

      {/* Activity section */}
      <div className="space-y-3">
        <motion.div {...tile(0.16)} className={`h-6 w-20 rounded-[8px] bg-primary ${shimmer}`} />
        <div className="space-y-1">
          <NotificationRowSkeleton delay={0.2} />
          <NotificationRowSkeleton delay={0.24} />
          <NotificationRowSkeleton delay={0.28} />
          <NotificationRowSkeleton delay={0.32} />
        </div>
      </div>
    </div>
  );
}
