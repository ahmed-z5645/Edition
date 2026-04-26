"use client";

interface PublishButtonProps {
  canPublish: boolean;
  isPublishing: boolean;
  onPublish: () => void;
}

export function PublishButton({
  canPublish,
  isPublishing,
  onPublish,
}: PublishButtonProps) {
  return (
    <button
      onClick={onPublish}
      disabled={!canPublish || isPublishing}
      className="rounded-[15px] bg-accent px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-40"
    >
      {isPublishing ? "Publishing..." : "Publish"}
    </button>
  );
}
