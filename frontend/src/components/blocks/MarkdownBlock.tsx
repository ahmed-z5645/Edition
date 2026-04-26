"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { MarkdownBlock as MarkdownBlockType, Block } from "@/lib/types/blocks";
import { BlockRenderer } from "./BlockRenderer";

interface MarkdownBlockProps {
  block: MarkdownBlockType;
  childBlocks?: Block[];
  isEditing?: boolean;
  onUpdate?: (content: { markdown: string }) => void;
}

export function MarkdownBlock({
  block,
  childBlocks = [],
  isEditing,
  onUpdate,
}: MarkdownBlockProps) {
  if (isEditing) {
    return (
      <div className="relative h-full p-4">
        <textarea
          className="h-full w-full resize-none bg-transparent text-sm outline-none"
          value={block.content.markdown}
          onChange={(e) => onUpdate?.({ markdown: e.target.value })}
          placeholder="Start writing..."
        />
        {childBlocks.map((child) => (
          <div
            key={child.id}
            className={`my-2 ${
              child.float_position === "left"
                ? "float-left mr-4 w-2/5"
                : child.float_position === "right"
                  ? "float-right ml-4 w-2/5"
                  : "mx-auto w-3/5"
            }`}
          >
            <BlockRenderer block={child} isEditing={isEditing} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="prose prose-sm h-full max-w-none p-4">
      {childBlocks.map((child) => (
        <div
          key={child.id}
          className={`my-2 ${
            child.float_position === "left"
              ? "float-left mr-4 w-2/5"
              : child.float_position === "right"
                ? "float-right ml-4 w-2/5"
                : "mx-auto w-3/5"
          }`}
        >
          <BlockRenderer block={child} />
        </div>
      ))}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {block.content.markdown}
      </ReactMarkdown>
    </div>
  );
}
