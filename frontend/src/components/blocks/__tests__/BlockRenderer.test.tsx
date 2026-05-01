import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlockRenderer } from "../BlockRenderer";
import type { Block } from "@/lib/types/blocks";

// Tiptap uses browser APIs not available in jsdom — mock MarkdownBlock
vi.mock("../MarkdownBlock", () => ({
  MarkdownBlock: ({ block }: { block: Block }) => (
    <div data-testid="markdown-block">{(block.content as { markdown: string }).markdown}</div>
  ),
}));

// ImageBlock uses file APIs — mock it
vi.mock("../ImageBlock", () => ({
  ImageBlock: () => <div data-testid="image-block">Image</div>,
}));

const gridLayout = {
  grid_layout_desktop: { colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 2 },
  grid_layout_mobile: { colStart: 1, colSpan: 1, rowStart: 1, rowSpan: 2 },
  float_position: null as null,
  z_index: 0,
  sort_order: 0,
  created_at: "2025-01-01T00:00:00",
  updated_at: "2025-01-01T00:00:00",
  post_id: "post-1",
  parent_block_id: null,
};

describe("BlockRenderer", () => {
  it("renders MarkdownBlock for type markdown", () => {
    const block: Block = {
      ...gridLayout,
      id: "b1",
      type: "markdown",
      content: { markdown: "Hello world" },
    };
    render(<BlockRenderer block={block} />);
    expect(screen.getByTestId("markdown-block")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders ImageBlock for type image", () => {
    const block: Block = {
      ...gridLayout,
      id: "b2",
      type: "image",
      content: { url: "https://example.com/img.png", alt: "test" },
    };
    render(<BlockRenderer block={block} />);
    expect(screen.getByTestId("image-block")).toBeInTheDocument();
  });

  it("renders QuoteBlock for type quote", () => {
    const block: Block = {
      ...gridLayout,
      id: "b3",
      type: "quote",
      content: { text: "A wise saying" },
    };
    render(<BlockRenderer block={block} />);
    expect(screen.getByText("A wise saying")).toBeInTheDocument();
  });

  it("renders CodeBlock for type code", () => {
    const block: Block = {
      ...gridLayout,
      id: "b4",
      type: "code",
      content: { code: "let x = 1;", language: "javascript" },
    };
    render(<BlockRenderer block={block} />);
    expect(screen.getByText("let x = 1;")).toBeInTheDocument();
  });

  it("renders map block with coordinates", () => {
    const block: Block = {
      ...gridLayout,
      id: "b5",
      type: "map",
      content: { lat: 51.5, lng: -0.12, label: "London" },
    };
    render(<BlockRenderer block={block} />);
    expect(screen.getByText(/London/)).toBeInTheDocument();
  });

  it("renders weather block with city", () => {
    const block: Block = {
      ...gridLayout,
      id: "b6",
      type: "weather",
      content: { city: "Toronto" },
    };
    render(<BlockRenderer block={block} />);
    expect(screen.getByText(/Toronto/)).toBeInTheDocument();
  });
});
