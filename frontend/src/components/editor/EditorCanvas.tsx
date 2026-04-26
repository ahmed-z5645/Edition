"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { Block, BlockType, Post } from "@/lib/types/blocks";
import type { DesktopLayout } from "@/lib/types/grid";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { BentoTile } from "@/components/bento/BentoTile";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { TitleInput } from "./TitleInput";
import { WordCounter } from "./WordCounter";
import { EditorToolbar } from "./EditorToolbar";
import { PublishButton } from "./PublishButton";
import { countWords } from "@/lib/utils/wordcount";
import { api } from "@/lib/api";

interface EditorCanvasProps {
  post: Post;
  initialBlocks: Block[];
}

const DEFAULT_LAYOUTS: Record<string, DesktopLayout> = {
  markdown: { colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 4 },
  image: { colStart: 3, colSpan: 1, rowStart: 1, rowSpan: 2 },
  code: { colStart: 3, colSpan: 2, rowStart: 1, rowSpan: 3 },
  spotify: { colStart: 4, colSpan: 1, rowStart: 1, rowSpan: 2 },
  strava: { colStart: 4, colSpan: 1, rowStart: 1, rowSpan: 2 },
  map: { colStart: 4, colSpan: 1, rowStart: 1, rowSpan: 2 },
  weather: { colStart: 4, colSpan: 1, rowStart: 1, rowSpan: 2 },
};

function findNextPosition(blocks: Block[]): DesktopLayout {
  if (blocks.length === 0) {
    return { colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 4 };
  }
  let maxRow = 0;
  for (const b of blocks) {
    const end = b.grid_layout_desktop.rowStart + b.grid_layout_desktop.rowSpan;
    if (end > maxRow) maxRow = end;
  }
  return { colStart: 1, colSpan: 1, rowStart: maxRow, rowSpan: 2 };
}

export function EditorCanvas({ post, initialBlocks }: EditorCanvasProps) {
  const [title, setTitle] = useState(post.title || "");
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const dirtyBlocksRef = useRef<Set<string>>(new Set());

  const wordCount = useMemo(() => {
    return blocks
      .filter((b) => b.type === "markdown" && !b.parent_block_id)
      .reduce((sum, b) => sum + countWords((b.content as { markdown: string }).markdown), 0);
  }, [blocks]);

  const canPublish = title.trim().length > 0 && wordCount >= 100;

  const topLevelBlocks = blocks.filter((b) => !b.parent_block_id);
  const childBlocksMap = useMemo(() => {
    const map: Record<string, Block[]> = {};
    for (const b of blocks) {
      if (b.parent_block_id) {
        if (!map[b.parent_block_id]) map[b.parent_block_id] = [];
        map[b.parent_block_id].push(b);
      }
    }
    return map;
  }, [blocks]);

  const saveAll = useCallback(async () => {
    if (!hasUnsavedChanges) return;
    setIsSaving(true);
    try {
      const promises: Promise<unknown>[] = [];
      promises.push(api.put(`/api/posts/${post.id}`, { title }));
      for (const blockId of dirtyBlocksRef.current) {
        const block = blocks.find((b) => b.id === blockId);
        if (block) {
          promises.push(api.put(`/api/blocks/${blockId}`, { content: block.content }));
        }
      }
      await Promise.all(promises);
      dirtyBlocksRef.current.clear();
      setHasUnsavedChanges(false);
    } catch (e) {
      console.error("Failed to save:", e);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, title, blocks, post.id]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveAll();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveAll]);

  const handleUpdateBlock = useCallback(
    (blockId: string, content: Record<string, unknown>) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId ? ({ ...b, content } as Block) : b
        )
      );
      dirtyBlocksRef.current.add(blockId);
      setHasUnsavedChanges(true);
    },
    []
  );

  async function handleAddBlock(type: BlockType) {
    const layout = DEFAULT_LAYOUTS[type] || findNextPosition(blocks);
    const position = findNextPosition(blocks);
    const gridLayout = blocks.length === 0 ? layout : position;

    try {
      const newBlock = await api.post<Block>(`/api/posts/${post.id}/blocks`, {
        type,
        content: type === "markdown" ? { markdown: "" } : type === "code" ? { code: "", language: "javascript" } : {},
        grid_layout_desktop: gridLayout,
        grid_layout_mobile: { order: blocks.length, colSpan: type === "markdown" ? 2 : 1 },
      });
      setBlocks((prev) => [...prev, newBlock]);
    } catch (e) {
      console.error("Failed to add block:", e);
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    setHasUnsavedChanges(true);
  }

  async function handlePublish() {
    setIsPublishing(true);
    try {
      await api.put(`/api/posts/${post.id}`, { title });
      for (const blockId of dirtyBlocksRef.current) {
        const block = blocks.find((b) => b.id === blockId);
        if (block) {
          await api.put(`/api/blocks/${blockId}`, { content: block.content });
        }
      }
      await api.post(`/api/posts/${post.id}/publish`);
      window.location.href = "/feed";
    } catch (e) {
      console.error("Failed to publish:", e);
      setIsPublishing(false);
    }
  }

  async function handleDeleteBlock(blockId: string) {
    try {
      await api.delete(`/api/blocks/${blockId}`);
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      dirtyBlocksRef.current.delete(blockId);
    } catch (e) {
      console.error("Failed to delete block:", e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <WordCounter count={wordCount} />
          {hasUnsavedChanges && (
            <span className="text-xs text-text/40">Unsaved changes — Ctrl+S to save</span>
          )}
          {isSaving && (
            <span className="text-xs text-text/40">Saving...</span>
          )}
        </div>
        <PublishButton
          canPublish={canPublish}
          isPublishing={isPublishing}
          onPublish={handlePublish}
        />
      </div>

      <TitleInput value={title} onChange={handleTitleChange} />

      <p className="text-sm text-text/40">
        {post.week_number && `Week ${post.week_number}, ${post.year}`}
      </p>

      <EditorToolbar onAddBlock={handleAddBlock} />

      <BentoGrid>
        {topLevelBlocks.map((block) => (
          <BentoTile
            key={block.id}
            desktopLayout={block.grid_layout_desktop}
            mobileLayout={block.grid_layout_mobile}
            className="group relative border border-primary"
          >
            <button
              onClick={() => handleDeleteBlock(block.id)}
              className="absolute right-2 top-2 z-10 hidden size-6 items-center justify-center rounded-full bg-text/10 text-xs hover:bg-accent hover:text-white group-hover:flex"
            >
              x
            </button>
            <BlockRenderer
              block={block}
              childBlocks={childBlocksMap[block.id]}
              isEditing={true}
              onUpdate={handleUpdateBlock}
            />
          </BentoTile>
        ))}
      </BentoGrid>
    </div>
  );
}
