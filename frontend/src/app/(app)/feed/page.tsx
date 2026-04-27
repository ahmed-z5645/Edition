"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { FeedLockGate } from "@/components/feed/FeedLockGate";
import { LateBadge } from "@/components/feed/LateBadge";

interface FeedPost {
  id: string;
  title: string | null;
  cover_color: string | null;
  is_late: boolean;
  profiles?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface FeedResponse {
  locked: boolean;
  posts?: FeedPost[];
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {feed.posts.map((post) => {
            const textColor =
              post.cover_color === "#223843" ? "#eff1f3" : "#223843";
            return (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group col-span-2 block"
              >
                <div
                  className="flex aspect-[2/1] flex-col justify-end rounded-[15px] p-5 transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: post.cover_color || "#d9d9d9" }}
                >
                  <div className="flex items-center gap-2">
                    {post.profiles?.username && (
                      <span
                        className="text-xs font-medium"
                        style={{ color: textColor, opacity: 0.6 }}
                      >
                        @{post.profiles.username}
                      </span>
                    )}
                    {post.is_late && <LateBadge />}
                  </div>
                  <h3
                    className="mt-1 font-[family-name:var(--font-cabinet)] text-lg font-bold leading-tight transition-opacity group-hover:opacity-80"
                    style={{ color: textColor }}
                  >
                    {post.title}
                  </h3>
                </div>
              </Link>
            );
          })}
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
