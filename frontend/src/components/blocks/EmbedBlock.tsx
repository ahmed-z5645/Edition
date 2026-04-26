"use client";

interface EmbedBlockProps {
  url: string;
  label: string;
  isEditing?: boolean;
  onUpdate?: (content: { url: string }) => void;
}

export function EmbedBlock({ url, label, isEditing, onUpdate }: EmbedBlockProps) {
  if (isEditing && !url) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
        <input
          type="text"
          placeholder={`Paste ${label} URL...`}
          className="w-full rounded-[15px] border border-primary bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onUpdate?.({ url: e.currentTarget.value });
            }
          }}
        />
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text/30">
        No {label} link
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-accent underline"
      >
        Open in {label}
      </a>
    </div>
  );
}
