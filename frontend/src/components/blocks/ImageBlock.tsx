"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ImageBlock as ImageBlockType } from "@/lib/types/blocks";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ImageBlockProps {
  block: ImageBlockType;
  isEditing?: boolean;
  onUpdate?: (content: { url: string; alt: string; caption?: string }) => void;
}

export function ImageBlock({ block, isEditing, onUpdate }: ImageBlockProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onUpdate?.({ url, alt: file.name });
    } catch (e) {
      console.error("Upload failed:", e);
    } finally {
      setUploading(false);
    }
  }

  if (isEditing && !block.content.url) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-[15px] bg-primary/50 px-4 py-2 text-sm hover:bg-primary disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload image"}
        </button>
        <span className="text-xs text-text/30">or</span>
        <input
          type="text"
          placeholder="Paste image URL..."
          className="w-full rounded-[15px] border border-primary bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onUpdate?.({ url: e.currentTarget.value, alt: "" });
            }
          }}
        />
      </div>
    );
  }

  if (block.content.url) {
    return (
      <div className="relative h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.content.url}
          alt={block.content.alt}
          className="h-full w-full rounded-[15px] object-cover"
        />
        {block.content.caption && (
          <p className="absolute bottom-0 w-full bg-text/50 p-2 text-xs text-white">
            {block.content.caption}
          </p>
        )}
        {isEditing && (
          <button
            onClick={() => onUpdate?.({ url: "", alt: "" })}
            className="absolute left-2 top-2 rounded-full bg-text/50 px-2 py-1 text-xs text-white hover:bg-accent"
          >
            Replace
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center text-sm text-text/30">
      No image
    </div>
  );
}
