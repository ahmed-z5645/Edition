"use client";

import { motion } from "framer-motion";

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-bg/40 before:to-transparent";

const tile = (delay: number) => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { delay, type: "spring" as const, stiffness: 400, damping: 25 },
});

function PostCardSkeleton({ delay }: { delay: number }) {
  return (
    <motion.div
      {...tile(delay)}
      className={`col-span-2 aspect-[2/1] rounded-[15px] bg-primary p-5 ${shimmer}`}
    >
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="h-3 w-16 rounded-full bg-text/8" />
          <div className="mt-3 h-7 w-4/5 rounded-[8px] bg-text/8" />
          <div className="mt-2 h-7 w-2/5 rounded-[8px] bg-text/8" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-full bg-text/8" />
          <div className="h-3 w-3/4 rounded-full bg-text/8" />
        </div>
      </div>
    </motion.div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header row */}
      <motion.div className="flex items-baseline justify-between" {...tile(0)}>
        <div className={`h-16 w-40 rounded-[12px] bg-primary ${shimmer}`} />
        <div className={`h-4 w-28 rounded-full bg-primary ${shimmer}`} />
      </motion.div>

      {/* Post cards grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <PostCardSkeleton delay={0.06} />
        <PostCardSkeleton delay={0.12} />
        <PostCardSkeleton delay={0.18} />
        <PostCardSkeleton delay={0.24} />
      </div>
    </div>
  );
}
