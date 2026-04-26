"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Post } from "@/lib/types/blocks";

export default function EditorPage() {
  const router = useRouter();

  useEffect(() => {
    api
      .get<Post>("/api/posts/me/current-week")
      .then((post) => {
        router.replace(`/editor/${post.id}`);
      })
      .catch((e) => {
        console.error("Failed to get current week post:", e);
      });
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}
