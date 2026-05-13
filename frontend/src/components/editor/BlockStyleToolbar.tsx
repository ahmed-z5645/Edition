"use client";

import { motion } from "framer-motion";
import { COVER_COLORS } from "@/lib/constants/colors";
import type { BlockStyle } from "@/lib/types/blocks";

interface BlockStyleToolbarProps {
  style: BlockStyle | undefined;
  onChange: (patch: Partial<BlockStyle>) => void;
}

export function BlockStyleToolbar({ style, onChange }: BlockStyleToolbarProps) {
  const current = style?.background_color ?? null;
  const borderless = !!style?.borderless;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      data-block-style-toolbar="true"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1 rounded-[12px] border border-primary bg-bg p-1.5 shadow-md"
    >
      <button
        type="button"
        onClick={() => onChange({ background_color: null })}
        title="No background"
        className={`flex size-6 items-center justify-center rounded-full border border-primary/60 bg-bg ${
          current === null ? "ring-2 ring-accent ring-offset-1 ring-offset-bg" : ""
        }`}
      >
        <svg viewBox="0 0 24 24" className="size-3 text-text/40">
          <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {COVER_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange({ background_color: c })}
          title={c}
          style={{ backgroundColor: c }}
          className={`size-6 rounded-full ${
            current === c ? "ring-2 ring-accent ring-offset-1 ring-offset-bg" : ""
          }`}
        />
      ))}
      <span className="mx-1 h-5 w-px bg-primary" />
      <button
        type="button"
        onClick={() => onChange({ borderless: !borderless })}
        title={borderless ? "Show border" : "Hide border"}
        className={`flex size-6 items-center justify-center rounded-[6px] ${
          borderless ? "bg-accent text-white" : "text-text/60 hover:bg-text/5"
        }`}
      >
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="3" strokeDasharray="3 3" />
        </svg>
      </button>
    </motion.div>
  );
}
