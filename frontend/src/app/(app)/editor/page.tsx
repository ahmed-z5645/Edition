"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Post } from "@/lib/types/blocks";
import { EditorSplashScreen } from "@/components/editor/EditorSplashScreen";

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

  return <EditorSplashScreen />;
}
