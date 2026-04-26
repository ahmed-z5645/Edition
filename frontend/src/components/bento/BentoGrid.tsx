"use client";

import { forwardRef, useRef, useEffect, useState, useImperativeHandle } from "react";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(
  function BentoGrid({ children, className }, ref) {
    const gridRef = useRef<HTMLDivElement>(null);
    const [rowHeight, setRowHeight] = useState(0);

    useImperativeHandle(ref, () => gridRef.current!);

    useEffect(() => {
      function updateRowHeight() {
        if (!gridRef.current) return;
        const gridWidth = gridRef.current.clientWidth;
        const gap = 16;
        const colWidth = (gridWidth - gap * 3) / 4;
        setRowHeight(colWidth / 2);
      }

      updateRowHeight();
      const observer = new ResizeObserver(updateRowHeight);
      if (gridRef.current) observer.observe(gridRef.current);
      return () => observer.disconnect();
    }, []);

    return (
      <div
        ref={gridRef}
        className={className}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridAutoRows: rowHeight || "auto",
          gap: 16,
        }}
      >
        {children}
      </div>
    );
  }
);

export function BentoGridMobile({ children, className }: BentoGridProps) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}
