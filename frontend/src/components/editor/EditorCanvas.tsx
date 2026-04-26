"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Block, BlockType, Post } from "@/lib/types/blocks";
import type { DesktopLayout, MobileLayout } from "@/lib/types/grid";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { DraggableTile } from "@/components/bento/DraggableTile";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { PrepublishScreen } from "./PrepublishScreen";
import { TitleInput } from "./TitleInput";
import { WordCounter } from "./WordCounter";
import { EditorToolbar } from "./EditorToolbar";
import { PublishButton } from "./PublishButton";
import { countWords } from "@/lib/utils/wordcount";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

interface EditorCanvasProps {
  post: Post;
  initialBlocks: Block[];
}

const DEFAULT_LAYOUTS: Record<string, DesktopLayout> = {
  markdown: { colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 4 },
  image: { colStart: 3, colSpan: 1, rowStart: 1, rowSpan: 2 },
  code: { colStart: 3, colSpan: 2, rowStart: 1, rowSpan: 4 },
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
  const [showMobileReview, setShowMobileReview] = useState(false);
  const [username, setUsername] = useState("");
  const dirtyBlocksRef = useRef<Set<string>>(new Set());
  const dirtyLayoutsRef = useRef<Set<string>>(new Set());

  const gridRef = useRef<HTMLDivElement>(null);
  const [gridMeta, setGridMeta] = useState({ colWidth: 0, rowHeight: 0 });

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUsername(data.user?.user_metadata?.username || "");
    });
  }, []);

  useEffect(() => {
    function update() {
      if (!gridRef.current) return;
      const w = gridRef.current.clientWidth;
      const gap = 16;
      const colWidth = (w - gap * 3) / 4;
      setGridMeta({ colWidth, rowHeight: colWidth / 2 });
    }
    update();
    const obs = new ResizeObserver(update);
    if (gridRef.current) obs.observe(gridRef.current);
    return () => obs.disconnect();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const wordCount = useMemo(() => {
    return blocks
      .filter((b) => b.type === "markdown" && !b.parent_block_id)
      .reduce(
        (sum, b) =>
          sum + countWords((b.content as { markdown: string }).markdown),
        0
      );
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
          promises.push(
            api.put(`/api/blocks/${blockId}`, { content: block.content })
          );
        }
      }
      for (const blockId of dirtyLayoutsRef.current) {
        const block = blocks.find((b) => b.id === blockId);
        if (block) {
          promises.push(
            api.put(`/api/blocks/${blockId}/layout`, {
              grid_layout_desktop: block.grid_layout_desktop,
              grid_layout_mobile: block.grid_layout_mobile,
            })
          );
        }
      }
      await Promise.all(promises);
      dirtyBlocksRef.current.clear();
      dirtyLayoutsRef.current.clear();
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    if (!gridMeta.colWidth || !gridMeta.rowHeight) return;

    const blockId = active.id as string;
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    const gap = 16;
    const colDelta = Math.round(delta.x / (gridMeta.colWidth + gap));
    const rowDelta = Math.round(delta.y / (gridMeta.rowHeight + gap));

    if (colDelta === 0 && rowDelta === 0) return;

    const layout = block.grid_layout_desktop;
    const newColStart = Math.max(1, Math.min(5 - layout.colSpan, layout.colStart + colDelta));
    const newRowStart = Math.max(1, layout.rowStart + rowDelta);

    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              grid_layout_desktop: {
                ...b.grid_layout_desktop,
                colStart: newColStart,
                rowStart: newRowStart,
              },
            }
          : b
      )
    );
    dirtyLayoutsRef.current.add(blockId);
    setHasUnsavedChanges(true);
  }

  function handleResize(blockId: string, changes: Partial<DesktopLayout>) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              grid_layout_desktop: { ...b.grid_layout_desktop, ...changes },
            }
          : b
      )
    );
    dirtyLayoutsRef.current.add(blockId);
    setHasUnsavedChanges(true);
  }

  async function handleAddBlock(type: BlockType) {
    const defaults = DEFAULT_LAYOUTS[type] || {
      colStart: 1,
      colSpan: 1,
      rowStart: 1,
      rowSpan: 2,
    };
    const position = findNextPosition(blocks);
    const gridLayout = {
      ...defaults,
      colStart: position.colStart,
      rowStart: position.rowStart,
    };

    try {
      const newBlock = await api.post<Block>(`/api/posts/${post.id}/blocks`, {
        type,
        content:
          type === "markdown"
            ? { markdown: "" }
            : type === "code"
              ? { code: "", language: "javascript" }
              : {},
        grid_layout_desktop: gridLayout,
        grid_layout_mobile: {
          colStart: 1,
          colSpan: type === "markdown" ? 2 : 1,
          rowStart: 1,
          rowSpan: type === "markdown" ? 4 : 2,
        },
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

  function handlePublishClick() {
    setShowMobileReview(true);
  }

  async function handlePrepublish(coverColor: string, mobileLayouts: Record<string, MobileLayout>, tags: string[]) {
    setIsPublishing(true);
    setShowMobileReview(false);
    try {
      await api.put(`/api/posts/${post.id}`, { title, cover_color: coverColor, tags });

      for (const blockId of dirtyBlocksRef.current) {
        const block = blocks.find((b) => b.id === blockId);
        if (block) {
          await api.put(`/api/blocks/${blockId}`, { content: block.content });
        }
      }

      for (const [blockId, layout] of Object.entries(mobileLayouts)) {
        await api.put(`/api/blocks/${blockId}/layout`, {
          grid_layout_mobile: layout,
        });
      }

      for (const blockId of dirtyLayoutsRef.current) {
        const block = blocks.find((b) => b.id === blockId);
        if (block) {
          await api.put(`/api/blocks/${blockId}/layout`, {
            grid_layout_desktop: block.grid_layout_desktop,
          });
        }
      }

      await api.post(`/api/posts/${post.id}/publish`);
      window.location.href = "/feed";
    } catch (e) {
      console.error("Failed to publish:", e);
      setIsPublishing(false);
    }
  }

  async function handleSaveDraft() {
    setShowMobileReview(false);
    await saveAll();
  }

  async function handleDeleteBlock(blockId: string) {
    try {
      await api.delete(`/api/blocks/${blockId}`);
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      dirtyBlocksRef.current.delete(blockId);
      dirtyLayoutsRef.current.delete(blockId);
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
            <span className="text-xs text-text/40">
              Unsaved changes — Ctrl+S to save
            </span>
          )}
          {isSaving && <span className="text-xs text-text/40">Saving...</span>}
        </div>
        <PublishButton
          canPublish={canPublish}
          isPublishing={isPublishing}
          onPublish={handlePublishClick}
        />
      </div>

      <TitleInput value={title} onChange={handleTitleChange} />

      <p className="text-sm text-text/40">
        {post.week_number && `Week ${post.week_number}, ${post.year}`}
      </p>

      <EditorToolbar onAddBlock={handleAddBlock} />

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <BentoGrid ref={gridRef}>
          {topLevelBlocks.map((block) => (
            <DraggableTile
              key={block.id}
              id={block.id}
              desktopLayout={block.grid_layout_desktop}
              mobileLayout={block.grid_layout_mobile}
              gridMeta={gridMeta}
              onResize={handleResize}
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
            </DraggableTile>
          ))}
        </BentoGrid>
      </DndContext>

      {showMobileReview && (
        <PrepublishScreen
          post={{ ...post, title }}
          blocks={blocks}
          username={username}
          onPublish={handlePrepublish}
          onSaveDraft={handleSaveDraft}
          onCancel={() => setShowMobileReview(false)}
        />
      )}
    </div>
  );
}
