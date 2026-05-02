"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function FeedLockGate({ postCount }: { postCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-[15px] border border-primary py-20"
    >
      <h2 className="mb-2 font-[family-name:var(--font-cabinet)] text-2xl font-bold">
        Feed is locked
      </h2>
      <p className="mb-1 text-sm text-text/60">
        Publish this week&apos;s post to see what others shared.
      </p>
      {postCount > 0 && (
        <p className="mb-6 text-sm text-text/40">
          {postCount} {postCount === 1 ? "person has" : "people have"} already
          posted this week.
        </p>
      )}
      <Link
        href="/editor"
        className="rounded-[15px] bg-text px-8 py-3 text-sm font-bold text-bg hover:bg-text/90"
      >
        Write your post
      </Link>
    </motion.div>
  );
}
