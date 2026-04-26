"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export function FollowButton({
  userId,
  initialFollowing,
}: {
  userId: string;
  initialFollowing: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/api/follows/${userId}`);
        setIsFollowing(false);
      } else {
        await api.post(`/api/follows/${userId}`, {});
        setIsFollowing(true);
      }
    } catch (e) {
      console.error("Follow toggle failed:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-[15px] px-5 py-2 text-sm transition-colors ${
        isFollowing
          ? "border border-primary text-text/60 hover:border-accent hover:text-accent"
          : "bg-text text-bg hover:bg-text/90"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
