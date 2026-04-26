"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Block } from "@/lib/types/blocks";
import type { MobileLayout } from "@/lib/types/grid";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

interface MobileLayoutReviewProps {
  blocks: Block[];
  title: string;
  onConfirm: (layouts: Record<string, MobileLayout>) => void;
  onCancel: () => void;
}

function compressToMobile(blocks: Block[]): Record<string, MobileLayout> {
  const topLevel = blocks
    .filter((b) => !b.parent_block_id)
    .sort((a, b) => {
      const ar = a.grid_layout_desktop.rowStart;
      const br = b.grid_layout_desktop.rowStart;
      if (ar !== br) return ar - br;
      return a.grid_layout_desktop.colStart - b.grid_layout_desktop.colStart;
    });

  const layouts: Record<string, MobileLayout> = {};
  let row = 1;

  for (const block of topLevel) {
    const colSpan = block.grid_layout_desktop.colSpan >= 2 ? 2 : 1;
    const rowSpan = colSpan * 2;
    layouts[block.id] = { colStart: 1, colSpan, rowStart: row, rowSpan };
    row += rowSpan;
  }

  return layouts;
}

function MobileDraggableTile({
  id,
  layout,
  gridMeta,
  onResize,
  children,
}: {
  id: string;
  layout: MobileLayout;
  gridMeta: { colWidth: number; rowHeight: number };
  onResize: (id: string, changes: Partial<MobileLayout>) => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const handleResizeCorner = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startY = e.clientY;
      const startColSpan = layout.colSpan;
      const startRowSpan = layout.rowSpan;
      const gap = 8;

      function onMove(ev: PointerEvent) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const colDelta = Math.round(dx / (gridMeta.colWidth + gap));
        const rowDelta = Math.round(dy / (gridMeta.rowHeight + gap));
        const newColSpan = Math.max(1, Math.min(3 - layout.colStart, startColSpan + colDelta));
        const newRowSpan = Math.max(1, startRowSpan + rowDelta);
        if (newColSpan !== layout.colSpan || newRowSpan !== layout.rowSpan) {
          onResize(id, { colSpan: newColSpan, rowSpan: newRowSpan });
        }
      }

      function onUp() {
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
      }

      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
    },
    [id, layout, gridMeta, onResize]
  );

  const style: React.CSSProperties = {
    gridColumn: `${layout.colStart} / span ${layout.colSpan}`,
    gridRow: `${layout.rowStart} / span ${layout.rowSpan}`,
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group/tile relative overflow-hidden rounded-[12px] border border-primary bg-bg"
    >
      <div
        {...listeners}
        {...attributes}
        className="flex h-5 cursor-grab items-center justify-center border-b border-primary/30 active:cursor-grabbing"
      >
        <div className="flex gap-0.5">
          <span className="size-0.5 rounded-full bg-text/20" />
          <span className="size-0.5 rounded-full bg-text/20" />
          <span className="size-0.5 rounded-full bg-text/20" />
        </div>
      </div>
      <div className="h-[calc(100%-20px)] overflow-hidden">{children}</div>
      <div
        onPointerDown={handleResizeCorner}
        className="absolute bottom-0.5 right-0.5 flex size-4 cursor-nwse-resize items-center justify-center rounded-sm opacity-0 transition-opacity group-hover/tile:opacity-100"
      >
        <svg viewBox="0 0 10 10" className="size-2.5 text-text/40">
          <path d="M9 1v8H1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export function MobileLayoutReview({
  blocks,
  title,
  onConfirm,
  onCancel,
}: MobileLayoutReviewProps) {
  const [visible, setVisible] = useState(false);
  const [layouts, setLayouts] = useState(() => compressToMobile(blocks));
  const topLevelBlocks = blocks.filter((b) => !b.parent_block_id);

  const gridRef = useRef<HTMLDivElement>(null);
  const [gridMeta, setGridMeta] = useState({ colWidth: 0, rowHeight: 0 });

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    function update() {
      if (!gridRef.current) return;
      const w = gridRef.current.clientWidth;
      const gap = 8;
      const colWidth = (w - gap) / 2;
      setGridMeta({ colWidth, rowHeight: colWidth / 2 });
    }
    update();
    const obs = new ResizeObserver(update);
    if (gridRef.current) obs.observe(gridRef.current);
    return () => obs.disconnect();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    if (!gridMeta.colWidth || !gridMeta.rowHeight) return;
    const blockId = active.id as string;
    const layout = layouts[blockId];
    if (!layout) return;

    const gap = 8;
    const colDelta = Math.round(delta.x / (gridMeta.colWidth + gap));
    const rowDelta = Math.round(delta.y / (gridMeta.rowHeight + gap));
    if (colDelta === 0 && rowDelta === 0) return;

    const newColStart = Math.max(1, Math.min(3 - layout.colSpan, layout.colStart + colDelta));
    const newRowStart = Math.max(1, layout.rowStart + rowDelta);

    setLayouts((prev) => ({
      ...prev,
      [blockId]: { ...prev[blockId], colStart: newColStart, rowStart: newRowStart },
    }));
  }

  function handleResize(blockId: string, changes: Partial<MobileLayout>) {
    setLayouts((prev) => ({
      ...prev,
      [blockId]: { ...prev[blockId], ...changes },
    }));
  }

  function handleClose() {
    setVisible(false);
    setTimeout(onCancel, 300);
  }

  function handleConfirm() {
    setVisible(false);
    setTimeout(() => onConfirm(layouts), 300);
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-text/40"
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[460px] flex-col bg-bg shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-primary p-5">
              <div>
                <h2 className="text-lg font-bold">Mobile Preview</h2>
                <p className="text-xs text-text/50">Drag and resize blocks</p>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-2 text-text/40 hover:bg-primary/30 hover:text-text"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
              {/* iPhone 16 ratio: 393×852 ≈ 1:2.168 */}
              <div className="relative flex w-full max-w-[340px] shrink-0 flex-col">
                <div
                  className="rounded-[40px] border-[6px] border-text/80 bg-bg p-3"
                  style={{ aspectRatio: "393 / 852" }}
                >
                  <div className="mx-auto mb-3 h-5 w-24 rounded-full bg-text/80" />

                  <div className="h-[calc(100%-40px)] overflow-y-auto px-2 pb-4">
                    <h1 className="mb-3 font-[family-name:var(--font-cabinet)] text-xl font-bold leading-tight">
                      {title || "Untitled"}
                    </h1>

                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                      <div
                        ref={gridRef}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gridAutoRows: gridMeta.rowHeight || "auto",
                          gap: 8,
                        }}
                      >
                        {topLevelBlocks.map((block) => {
                          const layout = layouts[block.id];
                          if (!layout) return null;
                          return (
                            <MobileDraggableTile
                              key={block.id}
                              id={block.id}
                              layout={layout}
                              gridMeta={gridMeta}
                              onResize={handleResize}
                            >
                              <div className="pointer-events-none h-full scale-[0.85] origin-top-left">
                                <BlockRenderer block={block} />
                              </div>
                            </MobileDraggableTile>
                          );
                        })}
                      </div>
                    </DndContext>
                  </div>

                  <div className="mx-auto mt-1 h-1 w-24 rounded-full bg-text/20" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-primary p-5">
              <button
                onClick={handleClose}
                className="flex-1 rounded-[15px] border border-primary py-3 text-sm hover:border-text"
              >
                Back to editing
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-[15px] bg-accent py-3 text-sm font-medium text-white hover:bg-accent/90"
              >
                Publish
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
