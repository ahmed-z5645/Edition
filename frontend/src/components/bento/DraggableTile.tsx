"use client";

import { useCallback, useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { DesktopLayout, MobileLayout } from "@/lib/types/grid";

interface DraggableTileProps {
  id: string;
  desktopLayout: DesktopLayout;
  mobileLayout: MobileLayout;
  gridMeta: { colWidth: number; rowHeight: number };
  onResize: (id: string, layout: Partial<DesktopLayout>) => void;
  children: React.ReactNode;
  className?: string;
  autoHeight?: boolean;
  zIndex?: number;
}

export function DraggableTile({
  id,
  desktopLayout,
  gridMeta,
  onResize,
  children,
  className,
  autoHeight,
  zIndex,
}: DraggableTileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoHeight) return;
    const el = contentRef.current;
    if (!el) return;

    function measure() {
      const grid = el!.closest("[data-bento-grid]") as HTMLElement | null;
      if (!grid) return;
      const rowHeight = parseFloat(grid.style.gridAutoRows);
      if (!rowHeight || isNaN(rowHeight)) return;
      const gap = 16;
      const dragHandleHeight = 24;
      const contentHeight = el!.scrollHeight + dragHandleHeight;
      const needed = Math.ceil((contentHeight + gap) / (rowHeight + gap));
      if (needed > desktopLayout.rowSpan) {
        onResize(id, { rowSpan: needed });
      }
    }

    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, [autoHeight, id, desktopLayout.rowSpan, onResize]);

  const handleResizeCorner = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startY = e.clientY;
      const startColSpan = desktopLayout.colSpan;
      const startRowSpan = desktopLayout.rowSpan;
      const gap = 16;

      function onMove(ev: PointerEvent) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const colDelta = Math.round(dx / (gridMeta.colWidth + gap));
        const rowDelta = Math.round(dy / (gridMeta.rowHeight + gap));
        const newColSpan = Math.max(1, Math.min(5 - desktopLayout.colStart, startColSpan + colDelta));
        const newRowSpan = Math.max(1, startRowSpan + rowDelta);
        if (newColSpan !== desktopLayout.colSpan || newRowSpan !== desktopLayout.rowSpan) {
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
    [id, desktopLayout, gridMeta, onResize]
  );

  const style: React.CSSProperties = {
    gridColumn: `${desktopLayout.colStart} / span ${desktopLayout.colSpan}`,
    gridRow: `${desktopLayout.rowStart} / span ${desktopLayout.rowSpan}`,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    zIndex: isDragging ? 50 : (zIndex || undefined),
    opacity: isDragging ? 0.8 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/tile relative ${autoHeight ? "" : "overflow-hidden"} rounded-[15px] bg-bg ${className ?? ""}`}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="flex h-6 cursor-grab items-center justify-center border-b border-primary/30 active:cursor-grabbing"
      >
        <div className="flex gap-0.5">
          <span className="size-1 rounded-full bg-text/20" />
          <span className="size-1 rounded-full bg-text/20" />
          <span className="size-1 rounded-full bg-text/20" />
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className={autoHeight ? "" : "h-[calc(100%-24px)] overflow-auto"}>{children}</div>

      {/* Bottom-right corner resize handle */}
      <div
        onPointerDown={handleResizeCorner}
        className="absolute bottom-1 right-1 flex size-5 cursor-nwse-resize items-center justify-center rounded-sm opacity-0 transition-opacity group-hover/tile:opacity-100"
      >
        <svg viewBox="0 0 10 10" className="size-3 text-text/40">
          <path d="M9 1v8H1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
