import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuoteBlock } from "../QuoteBlock";
import type { QuoteBlock as QuoteBlockType } from "@/lib/types/blocks";

const baseBlock: QuoteBlockType = {
  id: "block-1",
  post_id: "post-1",
  parent_block_id: null,
  type: "quote",
  content: { text: "To be or not to be", attribution: "Shakespeare" },
  grid_layout_desktop: { colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 2 },
  grid_layout_mobile: { colStart: 1, colSpan: 1, rowStart: 1, rowSpan: 2 },
  float_position: null,
  z_index: 0,
  sort_order: 0,
  created_at: "2025-01-01T00:00:00",
  updated_at: "2025-01-01T00:00:00",
};

describe("QuoteBlock", () => {
  it("renders quote text in view mode", () => {
    render(<QuoteBlock block={baseBlock} />);
    expect(screen.getByText("To be or not to be")).toBeInTheDocument();
  });

  it("renders attribution with em dash in view mode", () => {
    render(<QuoteBlock block={baseBlock} />);
    expect(screen.getByText("— Shakespeare")).toBeInTheDocument();
  });

  it("does not render attribution when absent", () => {
    const noAttrib: QuoteBlockType = {
      ...baseBlock,
      content: { text: "Just a quote" },
    };
    render(<QuoteBlock block={noAttrib} />);
    expect(screen.queryByText(/—/)).not.toBeInTheDocument();
  });

  it("shows textarea and attribution input in edit mode", () => {
    render(<QuoteBlock block={baseBlock} isEditing />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onUpdate when text changes in edit mode", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(<QuoteBlock block={baseBlock} isEditing onUpdate={onUpdate} />);
    const textarea = screen.getByDisplayValue("To be or not to be");
    await user.clear(textarea);
    await user.type(textarea, "New quote");
    expect(onUpdate).toHaveBeenCalled();
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.text).toContain("New quote");
  });

  it("shows Empty quote fallback in view mode when text is empty", () => {
    const empty: QuoteBlockType = { ...baseBlock, content: { text: "" } };
    render(<QuoteBlock block={empty} />);
    expect(screen.getByText("Empty quote")).toBeInTheDocument();
  });
});
