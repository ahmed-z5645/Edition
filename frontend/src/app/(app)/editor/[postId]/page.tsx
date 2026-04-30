"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Post, Block } from "@/lib/types/blocks";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorSplashScreen } from "@/components/editor/EditorSplashScreen";

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
    return <EditorSplashScreen />;
  }

  return <EditorCanvas post={post} initialBlocks={blocks} />;
}
