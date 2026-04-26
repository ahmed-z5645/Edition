"use client";

import type { CodeBlock as CodeBlockType } from "@/lib/types/blocks";

interface CodeBlockProps {
  block: CodeBlockType;
  isEditing?: boolean;
  onUpdate?: (content: { code: string; language: string }) => void;
}

export function CodeBlock({ block, isEditing, onUpdate }: CodeBlockProps) {
  if (isEditing) {
    return (
      <div className="flex h-full flex-col p-4">
        <select
          className="mb-2 rounded bg-primary/50 px-2 py-1 text-xs outline-none"
          value={block.content.language}
          onChange={(e) =>
            onUpdate?.({ ...block.content, language: e.target.value })
          }
        >
          {["javascript", "typescript", "python", "html", "css", "json", "bash", "other"].map(
            (lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            )
          )}
        </select>
        <textarea
          className="flex-1 resize-none bg-transparent font-mono text-xs outline-none"
          value={block.content.code}
          onChange={(e) =>
            onUpdate?.({ ...block.content, code: e.target.value })
          }
          placeholder="Paste code here..."
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-text/40">
        {block.content.language}
      </div>
      <pre className="text-xs">
        <code>{block.content.code}</code>
      </pre>
    </div>
  );
}
