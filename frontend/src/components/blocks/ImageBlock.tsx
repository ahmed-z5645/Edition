"use client";

import type { ImageBlock as ImageBlockType } from "@/lib/types/blocks";

interface ImageBlockProps {
  block: ImageBlockType;
  isEditing?: boolean;
  onUpdate?: (content: { url: string; alt: string; caption?: string }) => void;
}

export function ImageBlock({ block, isEditing, onUpdate }: ImageBlockProps) {
  if (isEditing && !block.content.url) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
        <input
          type="text"
          placeholder="Paste image URL..."
          className="w-full rounded-[15px] border border-primary bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onUpdate?.({
                url: e.currentTarget.value,
                alt: "",
              });
            }
          }}
        />
        <span className="text-xs text-text/50">Press Enter to add</span>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {block.content.url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.content.url}
            alt={block.content.alt}
            className="h-full w-full object-cover"
          />
          {block.content.caption && (
            <p className="absolute bottom-0 w-full bg-text/50 p-2 text-xs text-white">
              {block.content.caption}
            </p>
          )}
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-text/30">
          No image
        </div>
      )}
    </div>
  );
}
