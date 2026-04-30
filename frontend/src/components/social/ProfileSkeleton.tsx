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

export function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"
        {...tile(0)}
      >
        <div className="flex items-center gap-5">
          <div className={`size-20 shrink-0 rounded-full bg-primary ${shimmer}`} />
          <div className="space-y-2">
            <div className={`h-8 w-40 rounded-[8px] bg-primary ${shimmer}`} />
            <div className={`h-3.5 w-24 rounded-full bg-primary ${shimmer}`} />
            <div className={`h-3.5 w-56 rounded-full bg-primary ${shimmer}`} />
          </div>
        </div>

        {/* Stats */}
        <motion.div className="flex items-center gap-6" {...tile(0.08)}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`h-6 w-8 rounded-[6px] bg-primary ${shimmer}`} />
              <div className={`h-3 w-14 rounded-full bg-primary ${shimmer}`} />
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Divider */}
      <motion.hr {...tile(0.12)} className="border-primary" />

      {/* Posts grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <PostCardSkeleton delay={0.14} />
        <PostCardSkeleton delay={0.2} />
        <PostCardSkeleton delay={0.26} />
        <PostCardSkeleton delay={0.32} />
      </div>
    </div>
  );
}
