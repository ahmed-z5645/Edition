"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type FollowStatus = "accepted" | "pending" | null;

export function FollowButton({
  userId,
  initialFollowing,
  initialStatus = null,
}: {
  userId: string;
  initialFollowing: boolean;
  initialStatus?: FollowStatus;
}) {
  const [status, setStatus] = useState<FollowStatus>(
    initialFollowing ? "accepted" : initialStatus
  );
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      if (status === "accepted" || status === "pending") {
        await api.delete(`/api/follows/${userId}`);
        setStatus(null);
      } else {
        const res = await api.post<{ status: string }>(
          `/api/follows/${userId}`,
          {}
        );
        if (res.status === "followed" || res.status === "already_following") {
          setStatus("accepted");
        } else if (res.status === "requested" || res.status === "already_requested") {
          setStatus("pending");
        }
      }
    } catch (e) {
      console.error("Follow toggle failed:", e);
    } finally {
      setLoading(false);
    }
  }

  const label =
    status === "accepted"
      ? "Following"
      : status === "pending"
        ? "Requested"
        : "Follow";

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-[15px] px-5 py-2 text-sm transition-colors ${
        status === "accepted"
          ? "border border-primary text-text/60 hover:border-accent hover:text-accent"
          : status === "pending"
            ? "border border-primary text-text/40 hover:border-text/40"
            : "bg-text text-bg hover:bg-text/90"
      }`}
    >
      {label}
    </button>
  );
}
