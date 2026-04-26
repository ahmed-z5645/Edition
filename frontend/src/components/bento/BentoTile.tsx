"use client";

import type { DesktopLayout, MobileLayout } from "@/lib/types/grid";

interface BentoTileProps {
  desktopLayout: DesktopLayout;
  mobileLayout: MobileLayout;
  children: React.ReactNode;
  className?: string;
}

export function BentoTile({
  desktopLayout,
  children,
  className,
}: BentoTileProps) {
  return (
    <div
      className={`overflow-hidden rounded-[15px] bg-bg ${className ?? ""}`}
      style={{
        gridColumn: `${desktopLayout.colStart} / span ${desktopLayout.colSpan}`,
        gridRow: `${desktopLayout.rowStart} / span ${desktopLayout.rowSpan}`,
      }}
    >
      {children}
    </div>
  );
}

export function BentoTileMobile({
  mobileLayout,
  children,
  className,
}: {
  mobileLayout: MobileLayout;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[15px] bg-bg ${className ?? ""}`}
      style={{
        gridColumn: `span ${mobileLayout.colSpan}`,
        order: mobileLayout.order,
      }}
    >
      {children}
    </div>
  );
}
