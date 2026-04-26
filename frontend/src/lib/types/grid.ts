export interface DesktopLayout {
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
}

export interface MobileLayout {
  order: number;
  colSpan: 1 | 2;
}
