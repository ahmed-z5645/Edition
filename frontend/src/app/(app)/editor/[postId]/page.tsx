"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Post, Block } from "@/lib/types/blocks";
import { EditorCanvas } from "@/components/editor/EditorCanvas";

export default function EditorPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    Promise.all([
      api.get<Post>(`/api/posts/${postId}`),
      api.get<Block[]>(`/api/posts/${postId}/blocks`),
    ])
      .then(([postData, blocksData]) => {
        setPost(postData);
        setBlocks(blocksData);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [postId]);

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!post || !blocks) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return <EditorCanvas post={post} initialBlocks={blocks} />;
}
