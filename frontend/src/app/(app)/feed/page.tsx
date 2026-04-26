"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { FeedCard } from "@/components/feed/FeedCard";
import { FeedLockGate } from "@/components/feed/FeedLockGate";

interface FeedResponse {
  locked: boolean;
  posts?: Array<Record<string, unknown>>;
  post_count?: number;
  week: number;
  year: number;
}

export default function FeedPage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<FeedResponse>("/api/feed")
      .then(setFeed)
      .catch((e) => console.error("Failed to load feed:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="space-y-6">
        <h1 className="font-[family-name:var(--font-cabinet)] text-[64px] font-bold leading-tight">
          Feed
        </h1>
        <p className="text-sm text-text/40">Something went wrong loading the feed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="font-[family-name:var(--font-cabinet)] text-[64px] font-bold leading-tight">
          Feed
        </h1>
        <span className="text-sm text-text/40">
          Week {feed.week}, {feed.year}
        </span>
      </div>

      {feed.locked ? (
        <FeedLockGate postCount={feed.post_count || 0} />
      ) : feed.posts && feed.posts.length > 0 ? (
        <div className="space-y-10">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {feed.posts.map((post: any) => (
            <FeedCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[15px] border border-primary py-20">
          <p className="text-sm text-text/40">
            No posts yet this week from people you follow.
          </p>
        </div>
      )}
    </div>
  );
}
